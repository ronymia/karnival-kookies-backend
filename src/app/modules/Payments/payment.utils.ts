import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import Stripe from 'stripe';
import { logger, serverLogger } from '../../../shared/logger';

export class PaymentUtils {
  /**
   * Process a successful payment_intent event (order confirmation, payment record, cart cleanup)
   */
  public static async PaymentIntentSuceeded(
    connection: PoolConnection,
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const orderIdStr = paymentIntent.metadata?.order_id;
    const userIdStr = paymentIntent.metadata?.user_id;
    const transactionId = paymentIntent.id;
    const amount = paymentIntent.amount_received
      ? paymentIntent.amount_received / 100
      : paymentIntent.amount / 100;

    serverLogger.info(
      `[PaymentUtils] Processing payment_intent.succeeded: ${transactionId} for order_id: ${orderIdStr || 'N/A'}`,
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
            (paymentIntent.payment_method as string) || null,
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
            (paymentIntent.payment_method as string) || null,
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

      logger.info(`[PaymentUtils] Order #${orderId} confirmed and paid successfully`);
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
  }

  /**
   * Alias with double 'c' for spelling convenience
   */
  public static async PaymentIntentSucceeded(
    connection: PoolConnection,
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    return this.PaymentIntentSuceeded(connection, paymentIntent);
  }

  /**
   * Process a failed payment_intent event (order cancellation, payment failed status, coupon usage release)
   */
  public static async PaymentIntentFailed(
    connection: PoolConnection,
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    const orderIdStr = paymentIntent.metadata?.order_id;
    const transactionId = paymentIntent.id;

    serverLogger.warn(
      `[PaymentUtils] PaymentIntent failed: ${transactionId} for order_id: ${orderIdStr || 'N/A'}`,
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
    } else {
      await connection.execute(
        `UPDATE payments SET status = 'failed' WHERE transaction_id = ? OR stripe_payment_intent_id = ?`,
        [transactionId, transactionId],
      );
    }
  }
}
