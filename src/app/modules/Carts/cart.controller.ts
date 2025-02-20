import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { CartServices } from './cart.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';

// CREATE A NEW CART
const createCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await CartServices.createCart(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Cart create successfully',
      data: result,
    });
  },
);

// GET ALL CART USER SPECIFIC BY EMAIL
const getCartByUserId: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user_id = req.params.user_id;

    const result = await CartServices.getCartByUserId(Number(user_id));

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User Cart Data fetch successfully',
      meta: result.meta,
      data: result.data,
    });
  },
);

// UPDATE QUANTITY OF CART PRODUCT
const updateQuantityOfCartProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await CartServices.updateQuantityOfCartProduct(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Add quantity successfully',
      data: result,
    });
  },
);

// CHECKOUT BY EMAIL
const cartCheckOut: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...checkOutData } = req.body;

    const result = await CartServices.cartCheckOut(checkOutData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order placed successfully',
      data: result,
    });
  },
);

// DELETE CART
const removeFromCart: RequestHandler = catchAsync(
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

    const result = await CartServices.removeFromCart(parsedIds);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Remove from cart successfully',
      data: result,
    });
  },
);

export const CartControllers = {
  createCart,
  getCartByUserId,
  updateQuantityOfCartProduct,
  cartCheckOut,
  removeFromCart,
};
