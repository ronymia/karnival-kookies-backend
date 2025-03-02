import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import AppError from '../../../errors/AppError';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { reviewFilterableFields } from './review.constant';
import { RatingServices } from './review.service';

// CREATE
const createReview: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await RatingServices.createReview(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Rating Created successfully',
      data: result,
    });
  },
);

// GET ALL
const getAllReviews: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, reviewFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await RatingServices.getAllReviews(
      filters,
      paginationOptions,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Rating fetch successfully',
      meta: result.meta,
      data: result.data,
    });
  },
);

// UPDATE
const updateReview: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;
    const result = await RatingServices.updateReview(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Rating updated successfully',
      data: result,
    });
  },
);

// DELETE
const deleteReview: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ids } = req.params;
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

    // GET RESULT FROM SERVICE
    const result = await RatingServices.deleteReview(parsedIds);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Rating Deleted successfully',
      data: result,
    });
  },
);

export const RatingControllers = {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
};
