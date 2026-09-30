import amqplib, { Channel, ChannelModel } from 'amqplib';
import { errorLogger, logger } from '../shared/logger';
import { envConfig } from './env.config';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;
let isConnecting = false;
const connectListeners: Array<(channel: Channel) => void> = [];

/**
 * Register a listener invoked whenever RabbitMQ connects or reconnects
 */
export const onRabbitMQConnect = (listener: (channel: Channel) => void): void => {
  connectListeners.push(listener);
  if (channel) {
    try {
      listener(channel);
    } catch (err) {
      errorLogger.error(err as Error, 'Error executing RabbitMQ connect listener:');
    }
  }
};

/**
 * Resolve and format AMQP connection URL with encoded credentials
 */
export const resolveRabbitMQUrl = (): string => {
  const url = envConfig.rabbitmq.url?.trim() || '';

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

/**
 * Connect to RabbitMQ and initialize channel with auto-reconnection
 */
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

/**
 * Retrieve active RabbitMQ channel (or establish connection if not already open)
 */
export const getRabbitMQChannel = async (): Promise<Channel | null> => {
  if (!channel) {
    const result = await connectRabbitMQ();
    return result?.channel || null;
  }
  return channel;
};

/**
 * Retrieve active RabbitMQ connection
 */
export const getRabbitMQConnection = async (): Promise<ChannelModel | null> => {
  if (!connection) {
    const result = await connectRabbitMQ();
    return result?.connection || null;
  }
  return connection;
};

/**
 * Gracefully close active RabbitMQ channel and connection
 */
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
