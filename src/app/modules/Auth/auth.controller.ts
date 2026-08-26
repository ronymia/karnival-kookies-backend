import { RequestHandler, Request, Response, CookieOptions } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import { AuthServices } from './auth.service';
import { envConfig } from '../../../config';
import sendResponse from '../../../shared/sendResponse';
import { PasswordHelpers } from '../../../helpers/passwordHelpers';

//USER REGISTER
const RegisterUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...registerData } = req.body;

    registerData.password = await PasswordHelpers.passwordHash(
      registerData?.password,
    );

    const { ...result } = await AuthServices.registerUser(registerData);

    // SET REFRESH TOKEN TO COOKIE
    // const cookieOptions: CookieOptions = {
    //   secure: envConfig.node_env === 'production',
    //   httpOnly: true,
    //   sameSite: 'none',
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7DAYS
    // };
    // res.cookie('refresh_token', refreshToken, cookieOptions);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'user Register successfully',
      data: result,
    });
  },
);

// USER LOGIN
const loginUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...loginData } = req.body;

    const { refreshToken, ...result } = await AuthServices.loginUser(loginData);

    if (refreshToken) {
      // SET REFRESH TOKEN TO COOKIE
      const cookieOptions: CookieOptions = {
        secure: envConfig.node_env === 'production',
        httpOnly: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7DAYS
      };
      res.cookie('refresh_token', refreshToken, cookieOptions);
    }

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `${!result?.user?.is_email_verified ? `Verification Code Sent` : 'Login'} successfully`,
      data: result,
    });
  },
);

// REFRESH TOKEN
const getAccessToken: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.body.email;

    const { refreshToken, ...result } =
      await AuthServices.getAccessToken(email);

    if (refreshToken) {
      // SET REFRESH TOKEN TO COOKIE
      const cookieOptions: CookieOptions = {
        secure: envConfig.node_env === 'production',
        httpOnly: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7DAYS
      };
      res.cookie('refresh_token', refreshToken, cookieOptions);
    }

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `success`,
      data: result,
    });
  },
);

// REFRESH TOKEN
const refreshToken: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const refresh_token = req.cookies;

    const result = await AuthServices.refreshToken(refresh_token);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'user login successfully',
      data: result,
    });
  },
);

// RESET PASSWORD
const resetPassword: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    // HASH PASSWORD
    payloadData.password = await PasswordHelpers.passwordHash(
      payloadData?.password,
    );

    const result = await AuthServices.resetPassword(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Password Reset successfully',
      data: result,
    });
  },
);

// LOGOUT
const logOut: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // REMOVE REFRESH TOKEN TO COOKIE
    res.clearCookie('refresh_token');

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'user logout successfully',
      data: 'success',
    });
  },
);

// SEND PASSWORD CODE
const sendPasswordCode: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.body.email;

    const result = await AuthServices.sendPasswordCode(email);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `Password Code Sent successfully at ${email}`,
      data: result,
    });
  },
);

// VERIFY USER MAIL
const verifyUserMail: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const { success, message, refreshToken, ...result } =
      await AuthServices.verifyUserMail(payloadData);

    // SENT TOKEN
    if (refreshToken) {
      // SET REFRESH TOKEN TO COOKIE
      const cookieOptions: CookieOptions = {
        secure: envConfig.node_env === 'production',
        httpOnly: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7DAYS
      };
      res.cookie('refresh_token', refreshToken, cookieOptions);
    }
    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: success ? httpStatus.OK : httpStatus.UNPROCESSABLE_ENTITY,
      success: success as boolean,
      message: message as string,
      data: result,
    });
  },
);

// GET USER BY TOKEN
const getUserByToken: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const verifiedUser = req.user;

    const result = await AuthServices.getUserByToken(Number(verifiedUser?.id));

    // res.json(result);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'user retrieve successfully',
      data: result,
    });
  },
);

// GET USER BY TOKEN
const getUserByMail: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.params?.email;

    const result = await AuthServices.getUserByMail(email);

    // res.json(result);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'user retrieve successfully',
      data: result,
    });
  },
);

// VERIFY EMAIL CODE
const verifyEmailCode: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await AuthServices.verifyEmailCode(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: result?.success ? httpStatus.OK : httpStatus.BAD_REQUEST,
      success: result?.success,
      message: result?.message,
      data: null,
    });
  },
);

export const AuthControllers = {
  RegisterUser,
  loginUser,
  refreshToken,
  logOut,
  resetPassword,
  sendPasswordCode,
  verifyUserMail,
  getUserByToken,
  getUserByMail,
  verifyEmailCode,
  getAccessToken,
};
