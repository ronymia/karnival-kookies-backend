import { Request, RequestHandler, Response } from 'express';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { UserServices } from './user.service';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { userFilterableFields } from './user.constant';

// GET ALL USERS
const getAllUsers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, userFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await UserServices.getAllUsers(filters, paginationOptions);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Users fetch successfully',
      data: result,
    });
  },
);

// UPDATE
const updateUser: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...userData } = req.body;
    const email = req.params?.email;

    const result = await UserServices.updateUser(userData, email);

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
export const UserControllers = { updateUser, getAllUsers };
