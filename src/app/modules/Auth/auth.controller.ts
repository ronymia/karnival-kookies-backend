import { RequestHandler, Request, Response, CookieOptions } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import { AuthServices } from './auth.service';
import config from '../../../config';
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
    //   secure: config.node_env === 'production',
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
        secure: config.node_env === 'production',
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
const refreshToken: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const refresh_token = req.cookies;

    const result = await AuthServices.refreshToken(refresh_token);

    // SET REFRESH TOKEN TO COOKIE
    const cookieOptions: CookieOptions = {
      secure: config.node_env === 'product',
      httpOnly: true,
    };
    res.cookie('refresh_token', result, cookieOptions);

    //
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
    const email = req?.params?.email;
    const { ...password } = req.body;

    const result = await AuthServices.resetPassword(email, password?.password);

    // SET REFRESH TOKEN TO COOKIE
    // const cookieOptions = {
    //   secure: config.node_env === 'product',
    //   httpOnly: true,
    // };
    // res.cookie('refresh_token', result, cookieOptions);

    //
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
    // SET REFRESH TOKEN TO COOKIE
    // const cookieOptions = {
    //   secure: config.node_env === 'product',
    //   httpOnly: true,
    //   maxAge: 0,
    // };
    // res.clearCookie('refresh_token', cookieOptions);

    res.json(result);
    // SEND RESPONSE
    // sendResponse<any>(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: 'Code sent',
    //   data: result,
    // });
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
        secure: config.node_env === 'production',
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

// GET CURRENT USER
const getCurrentUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.cookies.refresh_token;
    // console.log({ refresh_token: req });

    const result = await AuthServices.getCurrentUser(token);

    res.json(result);
    // SET REFRESH TOKEN TO COOKIE
    // const cookieOptions = {
    //   secure: config.node_env === 'production',
    //   httpOnly: true,
    //   // sameSite: 'none',
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // };
    // res.cookie('refresh_token', refreshToken, cookieOptions);

    // SEND RESPONSE
    // sendResponse<any>(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: 'user Register successfully',
    //   data: result,
    // });
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
      message: 'user Register successfully',
      data: result,
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
  getCurrentUser,
  getUserByToken,
};
