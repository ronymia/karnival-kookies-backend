import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { RatingServices } from './rating.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';

// CREATE
const createRating: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await RatingServices.createRating(payloadData);

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
const getAllRatings: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, ratingFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { id } = req.params;

    const result = await RatingServices.getAllRatings(id);

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
const updateRating: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;
    const result = await RatingServices.updateRating(payloadData);

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
const deleteRating: RequestHandler = catchAsync(
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
    const result = await RatingServices.deleteRating(parsedIds);

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
  createRating,
  getAllRatings,
  updateRating,
  deleteRating,
};
