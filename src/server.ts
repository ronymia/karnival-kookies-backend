import { Server } from 'node:http';
import app from './app';
import { errorLogger, logger } from './shared/logger';
import 'dotenv/config';
import { envConfig, mysqlConnection } from './config';

(async ()=> {
  // SERVER LISTENING PORT
  const server: Server = app.listen(envConfig.port, () => {
    logger.info(`Server running on port ${envConfig.port}`);
  });

  // DATABASE CONNECTION
  mysqlConnection
    .then(() => logger.info('Database connection successful'))
    .catch((err) => errorLogger.error(err, 'Database connection error'));

  // Graceful shutdown function
  const exitHandler = async () => {
    if (server) {
      logger.info('Closing server...');
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            errorLogger.error(err, 'Error closing server');
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
    errorLogger.error(error as Error, 'Unexpected error');
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
})()

