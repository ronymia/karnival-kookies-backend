import { RequestHandler, Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import { AuthServices } from './auth.service';
import config from '../../../config';
import sendResponse from '../../../shared/sendResponse';
import { TLoginUserResponse } from './auth.interface';
import { PasswordHelpers } from '../../../helpers/passwordHelpers';

//   JWT TOKEN
// router.post("/jwt", async (req, res) => {
//   const user = req.body;
//   const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
//     expiresIn: "7d",
//   });
//   res
//     .cookie("token", token, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     })
//     .json({ success: true });
// });

//USER REGISTER
const RegisterUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...registerData } = req.body;

    registerData.password = await PasswordHelpers.passwordHash(
      registerData?.password,
    );

    const { refreshToken, ...result } =
      await AuthServices.registerUser(registerData);

    // SET REFRESH TOKEN TO COOKIE
    const cookieOptions = {
      secure: config.node_env === 'production',
      httpOnly: true,
      // sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie('refresh_token', refreshToken, cookieOptions);

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

    // SET REFRESH TOKEN TO COOKIE
    const cookieOptions = {
      secure: config.node_env === 'production',
      httpOnly: true,
      // sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie('refresh_token', refreshToken, cookieOptions);

    //
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'user login successfully',
      data: result,
    });
  },
);

// REFRESH TOKEN
const refreshToken: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const refresh_token = req.cookies;

    const result = await AuthServices.refreshToken();

    // SET REFRESH TOKEN TO COOKIE
    const cookieOptions = {
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

    const result = await AuthServices.resetPassword(email, password);

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
    // SET REFRESH TOKEN TO COOKIE
    const cookieOptions = {
      secure: config.node_env === 'product',
      httpOnly: true,
      maxAge: 0,
    };
    res.clearCookie('refresh_token', cookieOptions);

    //
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
  async (req: Request, res: Response, next: NextFunction) => {
    // const email = req.body.email;

    const result = await AuthControllers.sendPasswordCode(req, res, next);
    // SET REFRESH TOKEN TO COOKIE
    // const cookieOptions = {
    //   secure: config.node_env === 'product',
    //   httpOnly: true,
    //   maxAge: 0,
    // };
    // res.clearCookie('refresh_token', cookieOptions);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Code sent',
      data: result,
    });
  },
);

// VERIFY USER MAIL
const verifyUserMail: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...userData } = req.body;
    const email = req.params?.email;
    const otp = req.query?.otp;

    const result = await AuthServices.verifyUserMail(userData, email, otp);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User Updated successfully',
      data: result,
    });
  },
);

// GET CURRENT USER
const getCurrentUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const token = req.cookies.token;

    const result = await AuthServices.getCurrentUser(token);

    // SET REFRESH TOKEN TO COOKIE
    // const cookieOptions = {
    //   secure: config.node_env === 'production',
    //   httpOnly: true,
    //   // sameSite: 'none',
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
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

export const AuthControllers = {
  RegisterUser,
  loginUser,
  refreshToken,
  logOut,
  resetPassword,
  sendPasswordCode,
  verifyUserMail,
  getCurrentUser,
};
