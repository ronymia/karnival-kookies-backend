import httpStatus from 'http-status';
import Stripe from 'stripe';
import AppError from '../../../errors/AppError';
import { envConfig, mysqlcreateConnection as pool } from '../../../config';
import { stripe } from '../../../config/stripe.config';
import { QUEUES, RabbitMQService } from '../../../services/rabbitmq.service';
import { serverLogger } from '../../../shared/logger';
import { PaymentUtils } from '../Payments/payment.utils';

// STRIPE WEBHOOK HANDLER (ASYNC INGESTION VIA RABBITMQ WITH SYNC FALLBACK)
export const handleWebhook = async (
  rawBody: Buffer | string | any,
  signature?: string,
) => {
  let event: Stripe.Event;
  const webhookSecret = envConfig.stripe.webhook_secret;

  // 1. Cryptographic signature verification
  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err: any) {
      serverLogger.error(
        `Stripe Webhook Signature Verification Failed: ${err.message}`,
      );
      throw new AppError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
    }
  } else {
    // Fallback when webhook secret is not configured (e.g. testing)
    if (Buffer.isBuffer(rawBody)) {
      event = JSON.parse(rawBody.toString('utf8'));
    } else if (typeof rawBody === 'string') {
      event = JSON.parse(rawBody);
    } else {
      event = rawBody;
    }
  }

  // 2. Publish to RabbitMQ for asynchronous worker processing (Architecture A)
  try {
    await RabbitMQService.publish(QUEUES.STRIPE_PAYMENT_EVENTS, event);
    serverLogger.info(
      `Stripe webhook [${event.type}] queued successfully to RabbitMQ`,
    );
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
          await PaymentUtils.PaymentIntentSuceeded(
            connection,
            event.data.object as Stripe.PaymentIntent,
          );
          break;
        }

        case 'payment_intent.payment_failed': {
          await PaymentUtils.PaymentIntentFailed(
            connection,
            event.data.object as Stripe.PaymentIntent,
          );
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

export const StripeWebhookServices = {
  handleWebhook,
};
