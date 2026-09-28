import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { envConfig, mysqlcreateConnection as pool } from '../../../config';
import { stripe } from '../../../config/stripe.config';
import { PAYMENT_CURRENCY, PAYMENT_METHOD } from './payment.interface';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { GenerateTrackingAndOrderId } from '../Orders/order.utils';
import { serverLogger } from '../../../shared/logger';
import Stripe from 'stripe';
import { publishToQueue, QUEUES } from '../../../config/rabbitmq.config';

// STRIPE CONFIG
const stripeConfig = async () => {
  const stripeKey = envConfig.stripe.public_key;
  return { publishableKey: stripeKey };
};

// PAYMENT INTENT (BACKWARD COMPATIBLE)
const paymentIntent = async (payload: { price: number }) => {
  const { price } = payload;

  // IF PRICE IS EMPTY OR INVALID
  if (!price || price <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid price is required');
  }

  // Stripe expects amount in the smallest currency unit (cents for USD: $1 = 100 cents)
  const amountInCents = Math.round(Number(price) * 100);

  if (amountInCents < 50) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Amount must be at least $0.50 USD',
    );
  }

  // CREATE PAYMENT INTENT
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: PAYMENT_CURRENCY.USD,
    payment_method_types: [PAYMENT_METHOD.CARD],
  });

  return {
    clientSecret: paymentIntent?.client_secret,
  };
};

// PROCEED PAYMENT (NEW OPTION B METHOD)
interface IProceedPaymentPayload {
  price: number;
  user_id?: number;
  order_id?: number;
  order_items?: {
    product_id: number;
    quantity: number;
    price: number;
  }[];
  shipping_info?: {
    recipient_name: string;
    email: string;
    apartment?: string;
    address: string;
    city: string;
    postal_code: string;
    state?: string;
    country: string;
    phone: string;
    carrier?: string;
    delivery_instruction?: string;
  };
  coupon_code?: string;
  campaign_id?: number;
  discount_amount?: number;
  net_amount?: number;
  total_amount?: number;
  free_shipping?: boolean;
}

const proceedPayment = async (payload: IProceedPaymentPayload) => {
  const {
    price,
    user_id,
    order_id,
    order_items,
    shipping_info,
    coupon_code,
    campaign_id,
    free_shipping = false,
  } = payload;

  if (!price || price <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Valid price is required');
  }

  const amountInCents = Math.round(Number(price) * 100);
  if (amountInCents < 50) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Amount must be at least $0.50 USD',
    );
  }

  // 1. IF FULL CHECKOUT PAYLOAD IS PROVIDED (order_items + shipping_info)
  if (order_items && order_items.length > 0 && shipping_info && user_id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const order_number = GenerateTrackingAndOrderId.generateOrderId();
      const tracking_number = GenerateTrackingAndOrderId.generateTrackingNumber();

      const calculatedNetAmount = order_items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      );
      const net_amount =
        payload.net_amount !== undefined ? Number(payload.net_amount) : calculatedNetAmount;
      const discount_amount =
        payload.discount_amount !== undefined ? Number(payload.discount_amount) : 0;
      const total_amount =
        payload.total_amount !== undefined ? Number(payload.total_amount) : price;

      // Insert pending order
      const [orderResult] = await connection.execute<ResultSetHeader>(
        `INSERT INTO orders (
          user_id, order_number, tracking_number,
          net_amount, discount_amount, total_amount,
          coupon_code, campaign_id, free_shipping,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          user_id,
          order_number,
          tracking_number,
          net_amount,
          discount_amount,
          total_amount,
          coupon_code || null,
          campaign_id || null,
          free_shipping ? 1 : 0,
        ],
      );
      const newOrderId = orderResult.insertId;

      // If campaign was used, track in coupon_usages
      if (campaign_id) {
        let couponId = null;
        if (coupon_code) {
          const [cRows] = await connection.query<RowDataPacket[]>(
            `SELECT id FROM coupons WHERE code = ?`,
            [coupon_code.trim().toUpperCase()],
          );
          if (cRows.length > 0) couponId = cRows[0].id;
        }
        await connection.execute(
          `INSERT INTO coupon_usages (campaign_id, coupon_id, user_id, order_id) VALUES (?, ?, ?, ?)`,
          [campaign_id, couponId, user_id, newOrderId],
        );
      }

      // Insert order items
      const orderItemsValues = order_items.map((item) => [
        newOrderId,
        item.product_id,
        item.quantity,
        item.price,
      ]);
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`,
        [orderItemsValues],
      );

      // Insert shipping info
      await connection.execute(
        `INSERT INTO shipping_info
        (order_id, recipient_name, email, apartment, address, city, postal_code, state, country, phone, carrier, delivery_instruction)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newOrderId,
          shipping_info.recipient_name,
          shipping_info.email,
          shipping_info.apartment || null,
          shipping_info.address,
          shipping_info.city,
          shipping_info.postal_code,
          shipping_info.state || null,
          shipping_info.country,
          shipping_info.phone,
          shipping_info.carrier || null,
          shipping_info.delivery_instruction || null,
        ],
      );

      // Create Stripe PaymentIntent with order metadata
      const stripePaymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: PAYMENT_CURRENCY.USD,
        payment_method_types: [PAYMENT_METHOD.CARD],
        metadata: {
          order_id: String(newOrderId),
          user_id: String(user_id),
          order_number,
          coupon_code: coupon_code || '',
        },
      });

      // Insert pending payment record
      await connection.execute(
        `INSERT INTO payments (order_id, transaction_id, stripe_payment_intent_id, amount, method, status) 
         VALUES (?, ?, ?, ?, 'stripe', 'pending')`,
        [newOrderId, stripePaymentIntent.id, stripePaymentIntent.id, price],
      );

      await connection.commit();

      return {
        clientSecret: stripePaymentIntent.client_secret,
        paymentIntentId: stripePaymentIntent.id,
        order_id: newOrderId,
        order_number,
        net_amount,
        discount_amount,
        total_amount,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // 2. IF EXISTING order_id IS PROVIDED
  if (order_id) {
    const stripePaymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: PAYMENT_CURRENCY.USD,
      payment_method_types: [PAYMENT_METHOD.CARD],
      metadata: {
        order_id: String(order_id),
        user_id: user_id ? String(user_id) : '',
      },
    });

    return {
      clientSecret: stripePaymentIntent.client_secret,
      paymentIntentId: stripePaymentIntent.id,
      order_id,
    };
  }

  // 3. IF ONLY PRICE IS PROVIDED
  const stripePaymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: PAYMENT_CURRENCY.USD,
    payment_method_types: [PAYMENT_METHOD.CARD],
    metadata: {
      user_id: user_id ? String(user_id) : '',
    },
  });

  return {
    clientSecret: stripePaymentIntent.client_secret,
    paymentIntentId: stripePaymentIntent.id,
  };
};

// STRIPE WEBHOOK HANDLER (ASYNC INGESTION VIA RABBITMQ)
const handleWebhook = async (rawBody: Buffer | string | any, signature?: string) => {
  let event: Stripe.Event;
  const webhookSecret = envConfig.stripe.webhook_secret;

  // 1. Cryptographic signature verification
  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      serverLogger.error(`Stripe Webhook Signature Verification Failed: ${err.message}`);
      throw new AppError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
    }
  } else {
    // Fallback when webhook secret is not configured (e.g. testing)
    event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
  }

  // 2. Publish to RabbitMQ for asynchronous worker processing (Architecture A)
  try {
    await publishToQueue(QUEUES.STRIPE_PAYMENT_EVENTS, event);
    serverLogger.info(`Stripe webhook [${event.type}] queued successfully to RabbitMQ`);
    return { received: true, queued: true };
  } catch (queueError) {
    serverLogger.warn(
      `RabbitMQ publish failed, falling back to direct database processing: ${(queueError as Error).message}`,
    );

    // Synchronous fallback in case RabbitMQ broker is temporarily offline
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

          if (orderIdStr) {
            const orderId = Number(orderIdStr);
            await connection.execute(
              `UPDATE orders SET status = 'confirmed' WHERE id = ? AND status = 'pending'`,
              [orderId],
            );

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

            if (userIdStr) {
              const userId = Number(userIdStr);
              await connection.query(
                `DELETE FROM carts WHERE user_id = ?`,
                [userId],
              );
            }
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntentObj = event.data.object as Stripe.PaymentIntent;
          const orderIdStr = paymentIntentObj.metadata?.order_id;
          const transactionId = paymentIntentObj.id;

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
            await connection.execute(
              `DELETE FROM coupon_usages WHERE order_id = ?`,
              [orderId],
            );
          }
          break;
        }
      }

      await connection.commit();
      return { received: true, fallback: true };
    } catch (dbError) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }
  }
};

export const PaymentServices = {
  stripeConfig,
  paymentIntent,
  proceedPayment,
  handleWebhook,
};
