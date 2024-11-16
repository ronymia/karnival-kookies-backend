import jwt, { JwtPayload, Secret } from 'jsonwebtoken';

const createToken = (
  payload: object,
  secret: Secret,
  expiresTime: string,
): string => {
  return jwt.sign(payload, secret as Secret, {
    expiresIn: expiresTime,
  });
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};

export const JwtHelpers = {
  createToken,
  verifyToken,
};
