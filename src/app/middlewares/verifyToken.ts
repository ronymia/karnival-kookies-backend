import { NextFunction, Request, Response } from 'express';
import AppError from '../../errors/AppError';
import config from '../../config';
import { Secret } from 'jsonwebtoken';
import { JwtHelpers } from '../../helpers/jwtHelpers';
import httpStatus from 'http-status';

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    //get authorization token
    // const token = req.headers.authorization?.split(' ')[1];
    const token = req?.cookies?.refresh_token;
    // console.log({ first: token, second: req.cookies.token });
    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
    }
    // verify token
    let verifiedUser = null;

    verifiedUser = JwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token as Secret,
    );

    req.user = verifiedUser; // role  , userId

    // // role based guard
    // if (requiredRoles.length && !requiredRoles.includes(verifiedUser.role)) {
    //   throw new AppError(httpStatus.FORBIDDEN, 'Forbidden');
    // }
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyToken;
