import { NextFunction, Request, Response } from 'express';
import AppError from '../../errors/AppError';
import { envConfig } from '../../config';
import { Secret } from 'jsonwebtoken';
import { JwtHelpers } from '../../helpers/jwtHelpers';
import httpStatus from 'http-status';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
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

    next();
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
