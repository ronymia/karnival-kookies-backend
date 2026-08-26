import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { JwtHelpers } from '../../helpers/jwtHelpers';
import { envConfig } from '../../config';

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader && !authHeader?.startsWith('Bearer ')) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      //get authorization token
      const token = authHeader?.split(' ')[1];
      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }
      // verify token
      let verifiedUser = null;

      verifiedUser = JwtHelpers.verifyToken(
        token,
        envConfig.jwt.access_token as Secret,
      );

      req.user = verifiedUser; // role  , userId, email

      // role based guard
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
        throw new AppError(httpStatus.FORBIDDEN, 'Forbidden');
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
