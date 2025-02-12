import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { CategoryServices } from './categories.service';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { categoryFilterableFields } from './category.constant';

// CREATE
const createCategory: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...createData } = req.body;

    const result = await CategoryServices.createCategory(createData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Category Created successfully',
      data: result,
    });
  },
);

// GET ALL
const getAllCategories: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, categoryFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await CategoryServices.getAllCategories(
      filters,
      paginationOptions,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category Fetch successfully',
      meta: result?.meta,
      data: result.data,
    });
  },
);

// UPDATE
const updateCategory: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...updateData } = req.body;

    const result = await CategoryServices.updateCategory(updateData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category Updated successfully',
      data: result,
    });
  },
);
// DELETE
const deleteCategory: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { id } = req.params;

    const result = await CategoryServices.deleteCategory(Number(id));

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Category Deleted successfully',
      data: result,
    });
  },
);

//
export const CategoryControllers = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
