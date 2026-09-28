import amqplib, { Channel, ChannelModel } from 'amqplib';
import { errorLogger, logger } from '../shared/logger';
import { envConfig } from './env.config';

export const QUEUES = {
  STRIPE_PAYMENT_EVENTS: 'stripe_payment_events',
} as const;

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isConnecting = false;
const connectListeners: Array<(channel: Channel) => void> = [];

export const onRabbitMQConnect = (listener: (channel: Channel) => void) => {
  connectListeners.push(listener);
  if (channel) {
    try {
      listener(channel);
    } catch (err) {
      errorLogger.error(err as Error, 'Error executing RabbitMQ connect listener:');
    }
  }
};

// Resolve and format AMQP connection URL with encoded credentials
export const resolveRabbitMQUrl = (): string => {
  let url = envConfig.rabbitmq.url?.trim() || '';

  const user = process.env.RABBITMQ_DEFAULT_USER || process.env.RABBITMQ_USER;
  const pass = process.env.RABBITMQ_DEFAULT_PASS || process.env.RABBITMQ_PASSWORD;

  // If already starts with amqp:// or amqps://
  if (url.startsWith('amqp://') || url.startsWith('amqps://')) {
    // If user and pass are provided separately and not in URL, inject them
    if (user && pass && !url.includes('@')) {
      const protocol = url.startsWith('amqps://') ? 'amqps://' : 'amqp://';
      const hostPart = url.replace(/amqps?:\/\//, '');
      const encodedUser = encodeURIComponent(user);
      const encodedPass = encodeURIComponent(pass);
      return `${protocol}${encodedUser}:${encodedPass}@${hostPart}`;
    }
    return url;
  }

  // Construct complete AMQP URL
  const encodedUser = user ? encodeURIComponent(user) : 'guest';
  const encodedPass = pass ? encodeURIComponent(pass) : 'guest';
  const auth = `${encodedUser}:${encodedPass}@`;

  return `amqp://${auth}${url}`;
};

export const connectRabbitMQ = async (): Promise<{ connection: ChannelModel; channel: Channel } | null> => {
  if (channel && connection) {
    return { connection, channel };
  }

  if (isConnecting) {
    return null;
  }

  isConnecting = true;

  try {
    const rabbitUrl = resolveRabbitMQUrl();
    logger.info(`Connecting to RabbitMQ at ${rabbitUrl.replace(/:\/\/.*@/, '://***:***@')}...`);

    connection = await amqplib.connect(rabbitUrl);

    connection.on('error', (err) => {
      errorLogger.error(err, 'RabbitMQ connection error:');
    });

    connection.on('close', () => {
      logger.warn('RabbitMQ connection closed. Attempting to reconnect in 5s...');
      connection = null;
      channel = null;
      setTimeout(() => {
        connectRabbitMQ();
      }, 5000);
    });

    channel = await connection.createChannel();

    channel.on('error', (err) => {
      errorLogger.error(err, 'RabbitMQ channel error:');
    });

    channel.on('close', () => {
      logger.warn('RabbitMQ channel closed');
      channel = null;
    });

    // Assert primary queues
    await channel.assertQueue(QUEUES.STRIPE_PAYMENT_EVENTS, {
      durable: true,
    });

    logger.info('RabbitMQ connected and initialized successfully');
    isConnecting = false;

    // Trigger all registered consumers/listeners
    connectListeners.forEach((fn) => {
      try {
        fn(channel!);
      } catch (err) {
        errorLogger.error(err as Error, 'Error executing RabbitMQ connect listener:');
      }
    });

    return { connection, channel };
  } catch (error) {
    isConnecting = false;
    errorLogger.error(error as Error, 'Failed to connect to RabbitMQ:');
    logger.warn('Retrying RabbitMQ connection in 5s...');
    setTimeout(() => {
      connectRabbitMQ();
    }, 5000);
    return null;
  }
};

export const getRabbitMQChannel = async (): Promise<Channel | null> => {
  if (!channel) {
    const result = await connectRabbitMQ();
    return result?.channel || null;
  }
  return channel;
};

export const publishToQueue = async (
  queueName: string,
  message: any,
  options: amqplib.Options.Publish = { persistent: true },
): Promise<boolean> => {
  try {
    const ch = await getRabbitMQChannel();
    if (!ch) {
      throw new Error('RabbitMQ channel is not available');
    }

    await ch.assertQueue(queueName, { durable: true });

    const buffer = Buffer.from(
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
    errorLogger.error(error as Error, `Failed to publish message to [${queueName}]:`);
    throw error;
  }
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    logger.info('RabbitMQ connection and channel closed successfully');
  } catch (error) {
    errorLogger.error(error as Error, 'Error closing RabbitMQ connection:');
  }
};
