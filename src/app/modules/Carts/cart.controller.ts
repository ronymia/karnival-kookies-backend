import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { CartServices } from './cart.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { cartFilterableFields } from './cart.constant';
import { productFilterableFields } from '../Products/product.constant';
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

// GET ALL CARTS FOR ADMIN
const getAllCarts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    // const email = req.params.email;

    const result = await CartServices.getAllCarts(filters, paginationOptions);

    res.status(httpStatus.OK).json(result);
    // SEND RESPONSE
    // sendResponse<any>(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: 'Cart Data fetch successfully',
    //   data: result,
    // });
  },
);

// CHECKOUT BY EMAIL
const checkOutByEmail: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, cartFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const email = req.params.email;

    const result = await CartServices.checkOutByEmail(
      filters,
      paginationOptions,
      email,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cart Data fetch successfully',
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

// UPDATE CART STATUS
const updateCartStatus: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, cartFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const id = req.params.id;
    const { ...checkOutData } = req.body;

    const result = await CartServices.updateCartStatus(id, checkOutData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cart check out successfully',
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
  getAllCarts,
  checkOutByEmail,
  cartCheckOut,
  updateCartStatus,
  removeFromCart,
};
