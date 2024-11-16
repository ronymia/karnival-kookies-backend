import { ErrorRequestHandler } from 'express';
import { errorLogger } from '../../shared/logger';
import { TErrorSources } from '../../interfaces/error';
import AppError from '../../errors/AppError';
import { ZodError } from 'zod';
import config from '../../config';
import handleZodError from '../../errors/handleZodError';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  //Debug
  config.node_env === 'development'
    ? console.log(`🐱‍🏍 globalErrorHandler ~~`, err)
    : errorLogger.error(`🐱‍🏍 globalErrorHandler ~~`, err);

  //SETTING DEFAULT VALUES
  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorSources: TErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ];

  /*
    ?CHECKING ERRORS TYPE
   * Zod validation error
   * mongoose validation error
   * Duplicate Entity Error
   * mongoose cast error => invalid ObjectId
   * Custom throw error
   */

  //  ZOD ERRORS
  if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  } else if (err instanceof AppError) {
    statusCode = err?.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  } else if (err instanceof Error) {
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ];
  }

  //ultimate return
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack: config.node_env === 'development' ? err?.stack : null,
  });
};

export default globalErrorHandler;
