import { NextFunction, Request, Response } from 'express';
import AppError from '../../errors/AppError';
import config from '../../config';
import { Secret } from 'jsonwebtoken';
import { JwtHelpers } from '../../helpers/jwtHelpers';
import httpStatus from 'http-status';

// const verifyToken = async (req, res, next) => {
//   const token = req?.cookies?.token;
//   if (!token) {
//     return res.status(401).send({ message: 'Unauthorized access no token' });
//   } else {
//     jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
//       if (err) {
//         return res.status(401).send({ message: 'Unauthorized access error' });
//       }
//       req.user = user;
//       next();
//     });
//   }
// };

const verifyToken =
  () => async (req: Request, res: Response, next: NextFunction) => {
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
