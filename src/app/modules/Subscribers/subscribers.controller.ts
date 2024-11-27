import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { SubscriberServices } from './subscribers.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { subscribersFilterableFields } from './subscribers.constant';
import { paginationFields } from '../../../constants/pagination';

// CREATE
const createSubscribers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...createData } = req.body;

    const result = await SubscriberServices.createSubscribers(createData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'News Letter Subscription successfully',
      data: result,
    });
  },
);

// GET ALL
const getAllSubscribers: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, subscribersFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await SubscriberServices.getAllSubscribers(
      filters,
      paginationOptions,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Subscribers fetch successfully',
      data: result,
    });
  },
);

//
export const SubscribersControllers = { createSubscribers, getAllSubscribers };
