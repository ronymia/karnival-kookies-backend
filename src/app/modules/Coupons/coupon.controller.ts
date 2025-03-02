import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { CouponServices } from './coupon.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { CouponFilterableFields } from './coupon.constant';

// CREATE
const createCoupon: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await CouponServices.createCoupon(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Coupon Created successfully',
      data: result,
    });
  },
);

// UPDATE
const updateCoupon: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await CouponServices.updateCoupon(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Coupon update successfully',
      data: result,
    });
  },
);

// GET ALL
const getAllCoupons: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, CouponFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await CouponServices.getAllCoupons(
      filters,
      paginationOptions,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Coupon data fetch successfully',
      meta: result.meta,
      data: result.data,
    });
  },
);

// GET SINGLE COUPON CODE
const getCouponCodeById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CouponServices.getCouponCodeById(Number(id));

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Coupon data fetch successfully',
      data: result,
    });
  },
);

// DELETE
const deleteCoupon: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ids } = req.params;
    if (!ids || typeof ids !== 'string') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid IDs parameter');
    }

    // FILTER ID AND  CONVERT TO NUMBER
    const parsedIds = ids
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => !isNaN(id)); // ENSURE ALL IDS ARE VALID NUMBER

    if (parsedIds.length === 0) {
      throw new AppError(
        httpStatus.UNPROCESSABLE_ENTITY,
        `No valid IDs provided. ${ids}`,
      );
    }

    //
    const result = await CouponServices.deleteCoupon(parsedIds);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Coupon deleted successfully',
      data: result,
    });
  },
);

export const CouponControllers = {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  getCouponCodeById,
  deleteCoupon,
};
