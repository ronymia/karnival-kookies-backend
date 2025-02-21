import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { OrderServices } from './order.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { orderFilterableFields } from './order.constant';

// GET ALL ORDERS
const getAllOrders: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, orderFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await OrderServices.getAllOrders(filters, paginationOptions);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order fetch successfully',
      meta: result?.meta,
      data: result?.data,
    });
  },
);
// GET ALL ORDER BY USER ID
const getOrderByUserId: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, orderFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const user_id = req.params?.user_id;

    const result = await OrderServices.getOrderByUserId(
      Number(user_id),
      filters,
      paginationOptions,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order fetch successfully',
      meta: result.meta,
      data: result.data,
    });
  },
);

// UPDATE ORDER STATUS
const orderChangeStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;
    const { id } = req.params;

    const result = await OrderServices.orderChangeStatus(
      Number(id),
      payloadData,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order status updated successfully',
      data: result,
    });
  },
);

//
export const OrderControllers = {
  orderChangeStatus,
  getAllOrders,
  getOrderByUserId,
};
