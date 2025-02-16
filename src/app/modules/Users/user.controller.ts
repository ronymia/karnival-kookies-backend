import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { UserServices } from './user.service';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { userFilterableFields } from './user.constant';
import { PasswordHelpers } from '../../../helpers/passwordHelpers';
// UPDATE
const createUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    // HASH PASSWORD
    payloadData.password = await PasswordHelpers.passwordHash(
      payloadData?.password,
    );

    const result = await UserServices.createUser(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User Created successfully',
      data: result,
    });
  },
);

// GET ALL USERS
const getAllUsers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, userFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await UserServices.getAllUsers(filters, paginationOptions);

    // res.json(result);
    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Users fetch successfully',
      meta: result.meta,
      data: result.data,
    });
  },
);

// UPDATE
const updateUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...userData } = req.body;
    const id = req.params?.id;

    const result = await UserServices.updateUser(userData, Number(id));

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User Updated successfully',
      data: result,
    });
  },
);

// SEND TO ROUTE
export const UserControllers = { createUser, updateUser, getAllUsers };
