import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import AppError from '../../errors/AppError';
import { JwtHelpers } from '../../helpers/jwtHelpers';
import config from '../../config';

const auth =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const token = req.headers.authorization;
      if (!token) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }
      // verify token
      let verifiedUser = null;

      verifiedUser = JwtHelpers.verifyToken(
        token,
        config.jwt.access_token as Secret,
      );

      req.user = verifiedUser; // role  , userId

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
