import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import { CartServices } from './cart.service';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { cartFilterableFields } from './cart.constant';
import { productFilterableFields } from '../Products/product.constant';

// CREATE A NEW CART
const createCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...cartData } = req.body;

    const result = await CartServices.createCart(cartData);

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
const getCartByEmail: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const email = req.params.email;

    const result = await CartServices.getCartByEmail(email);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User Cart Data fetch successfully',
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

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cart Data fetch successfully',
      data: result,
    });
  },
);

// UPDATE CART
const updateCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...cartData } = req.body;

    const result = await CartServices.createCart(cartData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Cart upDATE successfully',
      data: result,
    });
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
const checkOut: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, cartFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    // const email = req.params.email;
    const { ...checkOutData } = req.body;

    const result = await CartServices.checkOut(checkOutData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cart check out successfully',
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
const deleteCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...cartData } = req.params;

    const result = await CartServices.deleteCart(cartData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Cart deleted successfully',
      data: result,
    });
  },
);
// DELETE BULK CART
const deleteBulkCart: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...cartData } = req.body;

    const result = await CartServices.deleteBulkCart(cartData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Full Cart deleted successfully',
      data: result,
    });
  },
);

export const CartControllers = {
  createCart,
  getCartByEmail,
  getAllCarts,
  updateCart,
  checkOutByEmail,
  checkOut,
  updateCartStatus,
  deleteCart,
  deleteBulkCart,
};
