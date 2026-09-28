import { ConsumeMessage } from 'amqplib';
import { RowDataPacket } from 'mysql2';
import Stripe from 'stripe';
import { mysqlcreateConnection as pool } from '../../../config';
import { onRabbitMQConnect, QUEUES } from '../../../config/rabbitmq.config';
import { errorLogger, logger, serverLogger } from '../../../shared/logger';

// Process a single payment webhook event inside a database transaction
const processPaymentEvent = async (event: Stripe.Event): Promise<void> => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntentObj = event.data.object as Stripe.PaymentIntent;
        const orderIdStr = paymentIntentObj.metadata?.order_id;
        const userIdStr = paymentIntentObj.metadata?.user_id;
        const transactionId = paymentIntentObj.id;
        const amount = paymentIntentObj.amount_received
          ? paymentIntentObj.amount_received / 100
          : paymentIntentObj.amount / 100;

        serverLogger.info(
          `[RabbitMQ Worker] Processing payment_intent.succeeded: ${transactionId} for order_id: ${orderIdStr}`,
        );

        if (orderIdStr) {
          const orderId = Number(orderIdStr);

          // 1. Confirm order (only if currently pending to prevent regressing shipped/delivered orders)
          await connection.execute(
            `UPDATE orders SET status = 'confirmed' WHERE id = ? AND status = 'pending'`,
            [orderId],
          );

          // 2. Check if payment record exists
          const [existingPayment] = await connection.query<RowDataPacket[]>(
            `SELECT id FROM payments WHERE order_id = ? OR transaction_id = ? OR stripe_payment_intent_id = ?`,
            [orderId, transactionId, transactionId],
          );

          if (existingPayment.length > 0) {
            await connection.execute(
              `UPDATE payments 
               SET status = 'paid', 
                   stripe_payment_intent_id = ?, 
                   stripe_payment_method_id = ? 
               WHERE id = ?`,
              [
                transactionId,
                (paymentIntentObj.payment_method as string) || null,
                existingPayment[0].id,
              ],
            );
          } else {
            await connection.execute(
              `INSERT INTO payments 
               (order_id, transaction_id, stripe_payment_intent_id, stripe_payment_method_id, amount, method, status) 
               VALUES (?, ?, ?, ?, ?, 'stripe', 'paid')`,
              [
                orderId,
                transactionId,
                transactionId,
                (paymentIntentObj.payment_method as string) || null,
                amount,
              ],
            );
          }

          // 3. Clear cart for user
          if (userIdStr) {
            const userId = Number(userIdStr);
            await connection.query(
              `DELETE FROM carts WHERE user_id = ?`,
              [userId],
            );
          }

          logger.info(`[RabbitMQ Worker] Order #${orderId} confirmed and paid successfully`);
        } else {
          // If no orderId in metadata, match by stripe_payment_intent_id or transaction_id
          const [paymentRows] = await connection.query<RowDataPacket[]>(
            `SELECT id, order_id FROM payments WHERE stripe_payment_intent_id = ? OR transaction_id = ?`,
            [transactionId, transactionId],
          );

          if (paymentRows.length > 0) {
            const p = paymentRows[0];
            await connection.execute(
              `UPDATE payments SET status = 'paid' WHERE id = ?`,
              [p.id],
            );
            if (p.order_id) {
              await connection.execute(
                `UPDATE orders SET status = 'confirmed' WHERE id = ? AND status = 'pending'`,
                [p.order_id],
              );
            }
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntentObj = event.data.object as Stripe.PaymentIntent;
        const orderIdStr = paymentIntentObj.metadata?.order_id;
        const transactionId = paymentIntentObj.id;

        serverLogger.warn(
          `[RabbitMQ Worker] PaymentIntent failed: ${transactionId} for order_id: ${orderIdStr}`,
        );

        if (orderIdStr) {
          const orderId = Number(orderIdStr);
          await connection.execute(
            `UPDATE orders SET status = 'cancelled' WHERE id = ? AND status = 'pending'`,
            [orderId],
          );
          await connection.execute(
            `UPDATE payments SET status = 'failed' WHERE order_id = ? OR stripe_payment_intent_id = ?`,
            [orderId, transactionId],
          );
          // Rollback coupon usage so customer can retry using the coupon
          await connection.execute(
            `DELETE FROM coupon_usages WHERE order_id = ?`,
            [orderId],
          );
        }
        break;
      }

      default: {
        serverLogger.info(`[RabbitMQ Worker] Unhandled event type: ${event.type}`);
        break;
      }
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Start the background consumer worker (re-subscribes automatically on reconnect)
export const startPaymentConsumer = (): void => {
  onRabbitMQConnect(async (channel) => {
    try {
      await channel.assertQueue(QUEUES.STRIPE_PAYMENT_EVENTS, { durable: true });
      await channel.prefetch(1); // Process 1 event at a time per worker instance

      logger.info(`[RabbitMQ Worker] Listening on queue [${QUEUES.STRIPE_PAYMENT_EVENTS}]...`);

      channel.consume(
        QUEUES.STRIPE_PAYMENT_EVENTS,
        async (msg: ConsumeMessage | null) => {
          if (!msg) return;

          try {
            const content = msg.content.toString();
            const event: Stripe.Event = JSON.parse(content);

            await processPaymentEvent(event);

            // Acknowledge message upon successful database processing
            channel.ack(msg);
          } catch (error) {
            errorLogger.error(
              error as Error,
              `[RabbitMQ Worker] Error processing message from [${QUEUES.STRIPE_PAYMENT_EVENTS}]:`,
            );

            // If the message has already been redelivered, reject without requeue (prevent poison-pill loops)
            if (msg.fields.redelivered) {
              logger.warn(
                `[RabbitMQ Worker] Message redelivered multiple times. Rejecting without requeue to prevent loop.`,
              );
              channel.nack(msg, false, false);
            } else {
              // Requeue once for transient network/DB glitches
              channel.nack(msg, false, true);
            }
          }
        },
        { noAck: false },
      );
    } catch (error) {
      errorLogger.error(error as Error, '[RabbitMQ Worker] Failed to start payment consumer:');
    }
  });
};
