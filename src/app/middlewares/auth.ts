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
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      //get authorization token
      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }
      // verify token
      let verifiedUser: any = null;

      try {
        verifiedUser = JwtHelpers.verifyToken(
          token,
          envConfig.jwt.access_token as Secret,
        );
      } catch (err: any) {
        if (err.name === 'TokenExpiredError') {
          const refresh_token = req.cookies?.refresh_token;
          if (!refresh_token) {
            throw new AppError(
              httpStatus.UNAUTHORIZED,
              'Token expired and no refresh token found',
            );
          }

          // Import here to avoid potential circular dependency issues at the top level
          const { AuthServices } = require('../modules/Auth/auth.service');

          const result = await AuthServices.refreshToken(refresh_token);
          const newToken = result.accessToken;

          // Expose the new access token in the response headers
          res.setHeader('x-access-token', newToken);

          // Verify the new token to get the user payload
          verifiedUser = JwtHelpers.verifyToken(
            newToken,
            envConfig.jwt.access_token as Secret,
          );
        } else {
          throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid token');
        }
      }

      req.user = verifiedUser; // role, userId, email

      // role based guard
      if (requiredRoles.length > 0) {
        const normalizedUserRole = (verifiedUser.role || '')
          .toLowerCase()
          .replace(/_/g, '');
        const normalizedRequiredRoles = requiredRoles.map((r) =>
          r.toLowerCase().replace(/_/g, ''),
        );

        if (!normalizedRequiredRoles.includes(normalizedUserRole)) {
          throw new AppError(httpStatus.FORBIDDEN, 'Forbidden');
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
