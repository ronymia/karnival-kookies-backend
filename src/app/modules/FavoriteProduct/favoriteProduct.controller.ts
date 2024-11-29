import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { FavoriteProductServices } from './favoriteProduct.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';

// ADD FAVORITE PRODUCT
const addFavoriteProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { ...payloadData } = req.body;

    const result =
      await FavoriteProductServices.addFavoriteProduct(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Product added into favorite list successfully',
      data: result,
    });
  },
);

// REMOVE FAVORITE PRODUCT
const removeFavoriteProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result =
      await FavoriteProductServices.removeFavoriteProduct(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product remove into favorite list successfully',
      data: result,
    });
  },
);

export const FavoriteProductControllers = {
  addFavoriteProduct,
  removeFavoriteProduct,
};
