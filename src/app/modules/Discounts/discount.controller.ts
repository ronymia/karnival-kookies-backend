import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { DiscountServices } from './discount.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

// CREATE
const createDiscount: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { ...createData } = req.body;

    const result = await DiscountServices.createDiscount(createData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Discount Created successfully',
      data: result,
    });
  },
);

// UPDATE
const updateDiscount: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { ...createData } = req.body;

    const result = await DiscountServices.updateDiscount(createData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Discount update successfully',
      data: result,
    });
  },
);

// GET ALL
const getAllDiscounts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, discountFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);

    const result = await DiscountServices.getAllDiscounts();

    res.status(200).json(result);
    // SEND RESPONSE
    // sendResponse<any>(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: 'Discount data fetch successfully',
    //   data: result,
    // });
  },
);

// DELETE
const deleteDiscount: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await DiscountServices.deleteDiscount(id);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Discount deleted successfully',
      data: result,
    });
  },
);

export const DiscountControllers = {
  createDiscount,
  updateDiscount,
  getAllDiscounts,
  deleteDiscount,
};
