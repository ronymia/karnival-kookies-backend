import Stripe from 'stripe';
import { mysqlcreateConnection as pool } from '../../../config';
import { QUEUES, RabbitMQService } from '../../../services/rabbitmq.service';
import { serverLogger } from '../../../shared/logger';
import { PaymentUtils } from './payment.utils';

// Process a single payment webhook event inside a database transaction
const processPaymentEvent = async (event: Stripe.Event): Promise<void> => {
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
  RabbitMQService.consume<Stripe.Event>(
    QUEUES.STRIPE_PAYMENT_EVENTS,
    async (event) => {
      await processPaymentEvent(event);
    },
    { prefetch: 1, durable: true },
  );
};
