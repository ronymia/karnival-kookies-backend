import { Request, RequestHandler, Response } from 'express';
import { ProductServices } from './product.services';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { productFilterableFields } from './product.constant';
import { paginationFields } from '../../../constants/pagination';

// CREATE
const createProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...productData } = req.body;

    const result = await ProductServices.createProduct(productData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Product CREATED successfully',
      data: result,
    });
  },
);

// GET ALL
const getAllClientProducts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await ProductServices.getAllClientProducts(
      filters,
      paginationOptions,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product fetch successfully',
      meta: result?.meta,
      data: result?.data,
    });
  },
);
// GET ALL
const getAllProducts: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await ProductServices.getAllProducts(
      filters,
      paginationOptions,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product fetch successfully',
      meta: result?.meta,
      data: result?.data,
    });
  },
);
// GET ALL
const getPriceBounds: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ProductServices.getPriceBounds();

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product price bounds fetch successfully',
      meta: result?.meta,
      data: result?.data,
    });
  },
);
// GET BY ID
const getProductById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { id } = req.params;

    const result = await ProductServices.getProductById(Number(id));

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product fetch successfully',
      data: result,
    });
  },
);

//   GET RANDOM PRODUCT
const getRandomProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, productFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await ProductServices.getRandomProduct(
      filters,
      paginationOptions,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product fetch successfully',
      meta: result.meta,
      data: result.data,
    });
  },
);

// UPLOAD PRODUCT IMAGES
const uploadProductImage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // Access the files
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const result = await ProductServices.uploadProductImage(files);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Product Files uploaded successfully',
      data: result,
    });
  },
);

// UPDATE
const updateProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...productData } = req.body;

    const result = await ProductServices.updateProduct(productData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product updated successfully',
      data: result,
    });
  },
);

// UPDATE
const deleteProduct: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await ProductServices.deleteProduct(Number(id));

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Product deleted successfully',
      data: result,
    });
  },
);

export const ProductControllers = {
  createProduct,
  getAllProducts,
  getPriceBounds,
  getAllClientProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getRandomProduct,
  uploadProductImage,
};
