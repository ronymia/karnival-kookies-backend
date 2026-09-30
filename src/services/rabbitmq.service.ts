import amqplib, { Channel, ConsumeMessage } from 'amqplib';
import { getRabbitMQChannel, onRabbitMQConnect } from '../config/rabbitmq.config';
import { errorLogger, logger } from '../shared/logger';

export const QUEUES = {
  STRIPE_PAYMENT_EVENTS: 'stripe_payment_events',
} as const;

export type TQueueName = (typeof QUEUES)[keyof typeof QUEUES] | string;

export interface IConsumeOptions {
  prefetch?: number;
  durable?: boolean;
  noAck?: boolean;
  requeueOnError?: boolean;
}

export class RabbitMQService {
  public static readonly QUEUES = QUEUES;

  /**
   * Publish a message to a RabbitMQ queue
   */
  public static async publish(
    queueName: string,
    message: any,
    options: amqplib.Options.Publish = { persistent: true },
  ): Promise<boolean> {
    try {
      const ch = await getRabbitMQChannel();
      if (!ch) {
        throw new Error('RabbitMQ channel is not available');
      }

      await ch.assertQueue(queueName, { durable: true });

      const buffer = Buffer.isBuffer(message)
        ? message
        : Buffer.from(
            typeof message === 'string' ? message : JSON.stringify(message),
          );

      const sent = ch.sendToQueue(queueName, buffer, options);
      if (sent) {
        logger.info(`Message published to RabbitMQ queue [${queueName}]`);
      } else {
        logger.warn(`RabbitMQ queue [${queueName}] buffer is full`);
      }
      return sent;
    } catch (error) {
      errorLogger.error(
        error as Error,
        `Failed to publish message to [${queueName}]:`,
      );
      throw error;
    }
  }

  /**
   * Aliases for publish as requested by user
   */
  public static async pulished(
    queueName: string,
    message: any,
    options?: amqplib.Options.Publish,
  ): Promise<boolean> {
    return this.publish(queueName, message, options);
  }

  public static async published(
    queueName: string,
    message: any,
    options?: amqplib.Options.Publish,
  ): Promise<boolean> {
    return this.publish(queueName, message, options);
  }

  /**
   * Consume messages from a RabbitMQ queue with automatic serialization and safe ack/nack handling
   */
  public static consume<T = any>(
    queueName: string,
    onMessage: (data: T, msg: ConsumeMessage, channel: Channel) => Promise<void> | void,
    options: IConsumeOptions = {},
  ): void {
    const { prefetch = 1, durable = true, noAck = false, requeueOnError = true } = options;

    onRabbitMQConnect(async (channel: Channel) => {
      try {
        await channel.assertQueue(queueName, { durable });
        if (prefetch > 0) {
          await channel.prefetch(prefetch);
        }

        logger.info(
          `[RabbitMQ Consumer] Subscribed to queue [${queueName}] with prefetch=${prefetch}`,
        );

        channel.consume(
          queueName,
          async (msg: ConsumeMessage | null) => {
            if (!msg) return;

            try {
              const content = msg.content.toString();
              let parsedData: any;
              try {
                parsedData = JSON.parse(content);
                if (
                  parsedData &&
                  parsedData.type === 'Buffer' &&
                  Array.isArray(parsedData.data)
                ) {
                  const inner = Buffer.from(parsedData.data).toString('utf8');
                  try {
                    parsedData = JSON.parse(inner);
                  } catch {
                    parsedData = inner;
                  }
                }
              } catch {
                parsedData = content;
              }

              await onMessage(parsedData as T, msg, channel);

              if (!noAck) {
                channel.ack(msg);
              }
            } catch (error) {
              errorLogger.error(
                error as Error,
                `[RabbitMQ Consumer] Error processing message from [${queueName}]:`,
              );

              if (!noAck) {
                // If message has already been redelivered, reject without requeue to prevent poison-pill loops
                if (msg.fields.redelivered) {
                  logger.warn(
                    `[RabbitMQ Consumer] Message redelivered multiple times on [${queueName}]. Rejecting to prevent loop.`,
                  );
                  channel.nack(msg, false, false);
                } else if (requeueOnError) {
                  // Requeue once for transient network/DB glitches
                  channel.nack(msg, false, true);
                } else {
                  channel.nack(msg, false, false);
                }
              }
            }
          },
          { noAck },
        );
      } catch (error) {
        errorLogger.error(
          error as Error,
          `[RabbitMQ Consumer] Failed to register consumer on queue [${queueName}]:`,
        );
      }
    });
  }

  /**
   * Aliases for consume as requested by user
   */
  public static consumer<T = any>(
    queueName: string,
    onMessage: (data: T, msg: ConsumeMessage, channel: Channel) => Promise<void> | void,
    options?: IConsumeOptions,
  ): void {
    return this.consume<T>(queueName, onMessage, options);
  }

  public static consumeer<T = any>(
    queueName: string,
    onMessage: (data: T, msg: ConsumeMessage, channel: Channel) => Promise<void> | void,
    options?: IConsumeOptions,
  ): void {
    return this.consume<T>(queueName, onMessage, options);
  }
}

// Backward compatibility standalone exports
export const publishToQueue = RabbitMQService.publish;