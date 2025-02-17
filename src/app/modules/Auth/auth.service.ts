import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { IRegisterUser, TLoginUser } from './auth.interface';
import { JwtHelpers } from '../../../helpers/jwtHelpers';
import config from '../../../config';
import { PasswordHelpers } from '../../../helpers/passwordHelpers';
import { pool } from '../../../shared/mySQL';
import { generateCode } from './auth.utils';
import { EmailHelpers } from '../../../helpers/emailHelpers';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { ENUM_USER_ROLE } from '../../../enums/user';
import moment from 'moment';

// USER REGISTER FUNCTION
const registerUser = async (payload: IRegisterUser) => {
  // PAYLOAD EXTRACT
  const {
    name,
    email,
    password,
    role,
    phone,
    address,
    country,
    city,
    postcode,
    date_of_birth,
    gender,
  } = payload;

  // CHECKING USER EXISTENT
  const [existAccount] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ?',
    [email],
  );

  // IF EMAIL ALREADY REGISTER THEN THROW ERROR
  if (existAccount.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Account already registered with this email: ${email}`,
    );
  }

  // GENERATE 4 DIGIT EMAIL VERIFICATION CODE
  const verificationCode = await generateCode();
  const hashedVerificationCode = await PasswordHelpers.passwordHash(
    verificationCode.toString(),
  );

  // START TRANSACTION
  const connection = await pool.getConnection();
  try {
    // START TRANSACTION
    await connection.beginTransaction();

    // CREATE USER ON DATABASE
    const [createdUser] = await pool.query<ResultSetHeader>(
      'INSERT INTO users (email, password, role, code) VALUES (?, ?, ?, ?)',
      [email, password, role, hashedVerificationCode],
    );

    if (!createdUser?.insertId) {
      // ROLLBACK TRANSACTION
      await connection.rollback();
      throw new AppError(httpStatus.BAD_REQUEST, 'User Not Created');
    } else if (createdUser?.insertId) {
      // CREATE USER PROFILE ON DATABASE
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO profiles (user_id, name,  phone, address, country, city, postcode, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          createdUser.insertId,
          name,
          phone,
          address,
          country,
          city,
          postcode,
          moment(date_of_birth, 'DD-MM-YYYY').format('YYYY-MM-DD'),
          gender,
        ],
      );
      // USER NOT CREATED
      if (!result.insertId) {
        // ROLLBACK TRANSACTION
        await connection.rollback();
        throw new AppError(httpStatus.BAD_REQUEST, 'User Not Created');
      }

      /* <------------------ IF USER CREATED THEN SEND VERIFICATION TO USER REGISTER EMAIL ------------------> */
      if (createdUser?.insertId && role === ENUM_USER_ROLE.CUSTOMER) {
        try {
          await EmailHelpers.emailVerification({
            name: '',
            email,
            code: verificationCode,
          });

          // IF USER UNVERIFIED
          return {
            accessToken: null,
            refreshToken: null,
            user: {
              id: createdUser?.insertId,
              role: role,
              email: email,
              is_email_verified: 0,
            },
          };
        } catch (err) {
          throw new AppError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'Failed to send verification email',
          );
        }
      }

      // COMMIT TRANSACTION
      await connection.commit();
    }
  } catch (error) {
    // ROLLBACK TRANSACTION
    await connection.rollback();
    throw error;
  } finally {
    // RELEASE CONNECTION
    connection.release();
  }

  // if (role !== ENUM_USER_ROLE.CUSTOMER) {
  //   return { id: result?.id, name, email, role, phone };
  // }

  // // ACCESS TOKEN
  // const accessToken = JwtHelpers.createToken(
  //   { email, role },
  //   config.jwt.access_token as Secret,
  //   config.jwt.access_token_expires_in as string,
  // );

  // // REFRESH TOKEN
  // const refreshToken = JwtHelpers.createToken(
  //   { email, role },
  //   config.jwt.refresh_token as Secret,
  //   config.jwt.refresh_token_expires_in as string,
  // );

  // // RETURN TO CONTROLLER
  // return {
  //   accessToken,
  //   refreshToken,
  //   user: { id: result[0]?.insertId, email, role },
  // };
};

// USER LOGIN
const loginUser = async (payload: TLoginUser) => {
  const { email, password } = payload;

  // FIND USER ON DATABASE
  const [existAccount] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM `users` WHERE `email` = ?',
    [email],
  );
  // EXTRACT USER FROM RESPONSE
  const user = existAccount[0];
  // IF USER NOT FOUND
  if (existAccount.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not Found');
  }

  // VERIFY PASSWORD MATCH

  const isPasswordMatch =
    user.password &&
    (await PasswordHelpers.passwordMatch(password, user.password));

  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Password incorrect');
  }

  /* <------------------ IF USER UNVERIFIED THEN SEND VERIFICATION CODE ------------------> */
  try {
    if (!!user && !user?.is_email_verified) {
      // EMAIL VERIFICATION CODE
      const verificationCode = await generateCode();
      const hashedCode = await PasswordHelpers.passwordHash(verificationCode);

      // UPDATE CODE ON DATABASE
      await pool.query('UPDATE users SET code = ? WHERE email = ?', [
        hashedCode,
        user?.email,
      ]);

      //  SEND VERIFICATION CODE INTO MAIL
      await EmailHelpers.emailVerification({
        name: user?.name,
        email: user?.email,
        code: verificationCode,
      });

      // IF USER UNVERIFIED
      return {
        accessToken: null,
        refreshToken: null,
        user: {
          id: user?.id,
          role: user?.role,
          email: user?.email,
          is_email_verified: user?.is_email_verified,
        },
      };
    }
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to send verification email',
    );
  }

  // create JWT token and refresh token
  const accessToken = JwtHelpers.createToken(
    { id: user?.id, email: user?.email, role: user?.role },
    config.jwt.access_token as Secret,
    config.jwt.access_token_expires_in as string,
  );
  const refreshToken = JwtHelpers.createToken(
    { id: user?.id, email: user?.email, role: user?.role },
    config.jwt.refresh_token as Secret,
    config.jwt.refresh_token_expires_in as string,
  );
  // IF USER VERIFIED
  return {
    accessToken,
    refreshToken,
    user: {
      id: user?.id,
      role: user?.role,
      email: user?.email,
      is_email_verified: user?.is_email_verified,
    },
  };
};

const refreshToken = async (token: string) => {
  // Invalid token - synchronous
  let verifiedToken = null;
  try {
    verifiedToken = JwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token as Secret,
    );
  } catch (err: any) {
    // Log the error for debugging purposes
    console.error('JWT verification error:', err);

    // Differentiate between token expiration and other errors
    if (err.name === 'TokenExpiredError') {
      throw new AppError(httpStatus.UNAUTHORIZED, 'JWT token has expired');
    } else if (err.name === 'JsonWebTokenError') {
      throw new AppError(httpStatus.FORBIDDEN, 'Invalid JWT token');
    } else {
      throw new AppError(httpStatus.FORBIDDEN, 'Could not verify JWT token');
    }
  }

  const { userEmail } = verifiedToken;

  const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    userEmail,
  ])) as any[];

  const isUserExist = rows[0];
  if (!isUserExist) {
    throw new AppError(httpStatus.NOT_FOUND, ' User not found');
  }
  //generate new token

  const newAccessToken = JwtHelpers.createToken(
    {
      userEmail: isUserExist.email,
      role: isUserExist.role,
    },
    config.jwt.access_token as Secret,
    config.jwt.access_token_expires_in as string,
  );

  return {
    accessToken: newAccessToken,
  };
};

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
const sendPasswordCode = async (email: string) => {
  console.log({ ResetEmail: email });

  const code = generateCode() + '';
  console.log({ code });

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
    // user: {
    //   id: user.id,
    //   name: user.name,
    //   email: user.email,
    // },
    // email: user.email,
  };
};

// VERIFY USER MAIL
const verifyUserMail = async (payload: { email: string; otp: string }) => {
  // GET USER BY MAIL
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ?',
    [payload?.email],
  );
  // EXTRACT USER
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
  if (!user?.is_email_verified) {
    // DECODE CODE
    const decryptedCode = await PasswordHelpers.passwordMatch(
      payload?.otp,
      user?.code,
    );
    if (!decryptedCode) {
      return { success: false, message: 'Invalid OTP' };
    }
  }

  // UPDATE USER ON DATABASE AS VERIFIED
  await pool.query(
    'UPDATE users SET code = NULL, is_email_verified = ? WHERE email = ?',
    [true, user?.email],
  );

  // SEND MAIL
  await EmailHelpers.congratulateOnAccountCreation({
    name: user?.name,
    email: user?.email,
  });

  // SEND TO CONTROLLER
  // create JWT token and refresh token
  const accessToken = JwtHelpers.createToken(
    { id: user?.id, email: user?.email, role: user?.role },
    config.jwt.access_token as Secret,
    config.jwt.access_token_expires_in as string,
  );
  const refreshToken = JwtHelpers.createToken(
    { id: user?.id, email: user?.email, role: user?.role },
    config.jwt.refresh_token as Secret,
    config.jwt.refresh_token_expires_in as string,
  );
  // IF USER VERIFIED
  return {
    success: true,
    message: 'User verified',
    accessToken,
    refreshToken,
    user: {
      id: user?.id,
      role: user?.role,
      email: user?.email,
      is_email_verified: user?.is_email_verified,
    },
  };
};

// GET CURRENT USER
const getCurrentUser = async (token: Secret) => {
  try {
    const decoded = jwt.verify(
      token as string,
      config.jwt.refresh_token as string,
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
          id: result.id,
          role: result.role,
          name: result.name,
          phone: result.phone,
          email: result.email,
          token,
          isVerified: result.isVerified,
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

// GET USER BY TOKEN
const getUserByToken = async (id: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ?',
    [id],
  );

  if (rows?.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not Found');
  }

  return rows[0];
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
  getUserByToken,
};
