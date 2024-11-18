import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { RatingServices } from './rating.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

// CREATE
const createRating: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { ...createData } = req.body;

    const result = await RatingServices.createRating(createData);

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

    res.status(200).json(result);
    // SEND RESPONSE
    // sendResponse<any>(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: 'Rating fetch successfully',
    //   data: result,
    // });
  },
);

// UPDATE
const updateRating: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...updateData } = req.body;
    const result = await RatingServices.updateRating(updateData);

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
    const { id } = req.params;
    const result = await RatingServices.deleteRating(id);

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
