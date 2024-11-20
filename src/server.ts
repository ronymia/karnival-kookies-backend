import { Server } from 'http';
import app from './app';
import { errorLogger, logger } from './shared/logger';
import config from './config';

async function bootstrap() {
  // SERVER LISTENING PORT
  const server: Server = app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port}`);
  });

  // Graceful shutdown function
  const exitHandler = async () => {
    if (server) {
      logger.info('Closing server...');
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            errorLogger.error('Error closing server', err);
            return reject(err);
          }
          logger.info('Server closed');
          resolve();
        });
      });
    }
    process.exit(1);
  };

  // Unexpected error handler
  const unexpectedErrorHandler = (error: unknown) => {
    errorLogger.error('Unexpected error:', error);
    exitHandler();
  };

  // Handle uncaught exceptions and rejections
  process.on('uncaughtException', unexpectedErrorHandler);
  process.on('unhandledRejection', unexpectedErrorHandler);

  // Handle graceful shutdown on SIGTERM
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received');
    exitHandler();
  });
}

bootstrap();
