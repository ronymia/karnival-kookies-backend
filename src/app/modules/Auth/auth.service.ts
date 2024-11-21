import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TLoginUser, TRegisterUser } from './auth.interface';
import { JwtHelpers } from '../../../helpers/jwtHelpers';
import config from '../../../config';
import { PasswordHelpers } from '../../../helpers/passwordHelpers';
import { pool } from '../../../shared/mySQL';
import { generateCode } from './auth.utils';
import { EmailHelpers } from '../../../helpers/emailHelpers';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';

// USER REGISTER FUNCTION
const registerUser = async (payload: TRegisterUser) => {
  const { email, password, phone, name } = payload;

  // Check if user already exists
  const [accounts] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ])) as any[];
  if (accounts.length > 0) {
    throw new AppError(httpStatus.CONFLICT, 'Account already registered');
  }

  // Generate hashed password
  // const hashedPassword = await bcrypt.hash(password, config.bcrypt_salt_rounds);
  const verificationCode = generateCode();

  // Create new user
  const [result] = (await pool.query(
    'INSERT INTO users (role, name, phone, email, password, code, isVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      'user',
      name,
      phone,
      email,
      password,
      verificationCode,
      false,
      new Date(),
      new Date(),
    ],
  )) as any[];

  // const userId = result.insertId; // MySQL insert ID
  // const role = 'user';

  // Create JWT tokens
  const { id: userId, role } = result;

  const accessToken = JwtHelpers.createToken(
    { userId, role },
    config.jwt.access_token as Secret,
    config.jwt.access_token_expires_in as string,
  );
  const refreshToken = JwtHelpers.createToken(
    { id: userId, role },
    config.jwt.refresh_token as Secret,
    config.jwt.refresh_token_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    user: { id: userId, name, email, role, phone },
  };
};

// USER LOGIN
const loginUser = async (payload: TLoginUser) => {
  const { email, password } = payload;

  // FIND USER ON DATABASE
  const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ])) as any[];
  const user = rows[0];

  //VERIFY PASSWORD MATCH
  if (!(await PasswordHelpers.passwordMatch(password, user.password))) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password do not match');
  }
  //   IF USER NOT FOUND
  // IF NOT EXIST
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not Found');
  }
  // IF USER UNVERIFIED
  // if (user && !user?.isVerified) {
  //   const salt = await bcrypt.genSalt(12);
  //   const hashedCode = await bcrypt.hash(code, salt);
  //   await pool.query('UPDATE users SET code = ? WHERE email = ?', [
  //     hashedCode,
  //     user?.email,
  //   ]);
  //   await verifyUserMail(user?.name, user?.email, code);
  //   return res.json({
  //     need_to_verify: true,
  //     message: 'Code sent',
  //     email: user?.email,
  //   });
  // }
  // IF USER VERIFIED
  // if (user?.isVerified) {
  //   return {
  //     id: user?.id,
  //     role: user?.role,
  //     name: user?.name,
  //     phone: user?.phone,
  //     email: user?.email,
  //     isVerified: user?.isVerified,
  //     createdAt: user?.createdAt,
  //     updatedAt: user?.updatedAt,
  //   };
  // }
  // check password
  const isPasswordMatch =
    user.password &&
    (await PasswordHelpers.passwordMatch(password, user.password));
  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, ' Password incorrect');
  }
  // create JWT token and refresh token
  const { id: userId, role } = user;
  const accessToken = JwtHelpers.createToken(
    { userId, role },
    config.jwt.access_token as Secret,
    config.jwt.access_token_expires_in as string,
  );
  const refreshToken = JwtHelpers.createToken(
    { userId, role },
    config.jwt.refresh_token as Secret,
    config.jwt.refresh_token_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user?.id,
      role: user?.role,
      name: user?.name,
      phone: user?.phone,
      email: user?.email,
      isVerified: user?.isVerified,
      createdAt: user?.createdAt,
      updatedAt: user?.updatedAt,
    },
  };
};

const refreshToken = async () => {};

// PASSWORD RESET
const resetPassword = async (email: string, password: string) => {
  const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ])) as any[];

  const user = rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not Found');
  }

  const hashedPassword = await PasswordHelpers.passwordHash(password);

  const result = await pool.query(
    'UPDATE users SET password = ?, code = NULL WHERE email = ?',
    [hashedPassword, email],
  );

  //
  return result;
};

//  SEND PASSWORD CODE
const sendPasswordCode = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  const code = generateCode() + '';

  // Check if the user exists
  const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ])) as any[];

  const user = rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not Found');
  }
  // Hash the code
  const hashedCode = await PasswordHelpers.passwordHash(code);

  // Update the user with the hashed code
  await pool.query('UPDATE users SET code = ? WHERE email = ?', [
    hashedCode,
    email,
  ]);

  // Send reset password email
  await EmailHelpers.resetPasswordCode(user.name, user.email, code);

  // SEND TO CONTROLLER
  return {
    success: true,
    message: 'Code sent',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    email: user.email,
  };
};

// VERIFY USER MAIL
const verifyUserMail = async (payload: any, email: string, otp: any) => {
  //
  const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ])) as any[];
  const user = rows[0];

  // USER NOT EXIST
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not Found');
  }

  // CHECK CODE ON DATABASE
  if (!user?.code) {
    return {
      success: false,
      message: 'Code not sent. Please send code again',
    };
  }

  // VERIFY CODE
  if (user?.isVerified) {
    if (user?.code) {
      // DECODE CODE
      const decryptedCode = await PasswordHelpers.passwordMatch(
        otp,
        user?.code,
      );
      if (!decryptedCode) {
        return { success: false, message: 'Invalid OTP' };
      }
    } else {
      return { success: true, message: 'User is already verified' };
    }
  }

  // DECODE CODE
  const decryptedCode = await PasswordHelpers.passwordMatch(otp, user?.code);
  if (!decryptedCode) {
    return { success: false, message: 'Invalid OTP' };
  }
  //
  await pool.query(
    'UPDATE users SET code = NULL, isVerified = ? WHERE email = ?',
    [true, user?.email],
  );

  // SEND MAIL
  await EmailHelpers.congratulateOnAccountCreation(user?.name, user?.email);

  // SEND TO CONTROLLER
  return { success: true, message: 'User is verified' };
};

// GET CURRENT USER
const getCurrentUser = async (token: Secret) => {
  console.log({ token });
  try {
    const decoded = jwt.verify(
      token as string,
      config.jwt.access_token as string,
    ) as JwtPayload | null;

    if (!decoded || typeof decoded === 'string' || !decoded.email) {
      return { user: null };
    }

    // Query the database for the user
    const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
      decoded.email,
    ])) as any[];

    const result = rows[0];
    if (result?.isVerified) {
      return {
        user: {
          role: result.role,
          name: result.name,
          phone: result.phone,
          email: result.email,
          token,
          isVerified: result.isVerified,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        },
      };
    } else {
      return { user: null };
    }
  } catch (err) {
    // Handle invalid token or other errors
    return { user: null };
  }
};

//
export const AuthServices = {
  registerUser,
  loginUser,
  resetPassword,
  sendPasswordCode,
  verifyUserMail,
  getCurrentUser,
  refreshToken,
};
