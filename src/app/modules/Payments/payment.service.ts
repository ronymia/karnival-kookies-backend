import httpStatus from 'http-status';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { mysqlcreateConnection as pool } from '../../../config';
import { stripe } from '../../../config/stripe.config';
import AppError from '../../../errors/AppError';
import { GenerateTrackingAndOrderId } from '../Orders/order.utils';
import {
  IProceedPaymentPayload,
  PAYMENT_CURRENCY,
  PAYMENT_METHOD,
} from './payment.interface';

// PROCEED PAYMENT (NEW OPTION B METHOD)
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

export const PaymentServices = {
  proceedPayment,
};

