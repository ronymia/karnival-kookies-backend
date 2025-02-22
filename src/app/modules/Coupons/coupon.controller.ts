import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { CouponServices } from './coupon.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

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
    // const filters = pick(req.query, CouponFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);

    const result = await CouponServices.getAllCoupons();

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

// DELETE
const deleteCoupon: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await CouponServices.deleteCoupon(id);

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
  deleteCoupon,
};
