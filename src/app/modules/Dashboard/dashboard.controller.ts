import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import { DashboardServices } from './dashboard.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

// GET ADMIN DASHBOARD DATA
const adminDashboard: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);

    const result = await DashboardServices.adminDashboard();

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Admin Dashboard Data fetch successfully',
      data: result,
    });
  },
);

// GET USER SPECIFIC DASHBOARD DATA
const userDashboard: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const email = req.params?.email;

    const result = await DashboardServices.userDashboard(email);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User Dashboard Data fetch successfully',
      data: result,
    });
  },
);

//
export const DashboardControllers = { adminDashboard, userDashboard };
