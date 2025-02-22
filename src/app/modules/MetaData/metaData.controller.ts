import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import { MetaDataServices } from './metaData.service';
import sendResponse from '../../../shared/sendResponse';
import AppError from '../../../errors/AppError';

// CREATE META DATA
const createMetaData: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await MetaDataServices.createMetaData(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Meta Data Created successfully',
      data: result,
    });
  },
);

// GET ALL META DATA
const getAllMetaData: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, packageFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const url = req.query.url as string | undefined;

    if (url && typeof url !== 'string') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid URL parameter');
    }

    const result = await MetaDataServices.getAllMetaData(url);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Meta Data fetch successfully',
      meta: result?.meta,
      data: result?.data,
    });
  },
);

// GET META DATA BY ID
const getMetaDataById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await MetaDataServices.getMetaDataById(Number(id));

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Meta Data fetch successfully',
      data: result,
    });
  },
);

// UPDATE META DATA
const updateMetaData: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await MetaDataServices.updateMetaData(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Meta Data update successfully',
      data: result,
    });
  },
);

// DELETE META DATA
const deleteMetaData: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ids } = req.params;
    if (!ids || typeof ids !== 'string') {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid IDs parameter');
    }

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
    const result = await MetaDataServices.deleteMetaData(parsedIds);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Meta Data delete successfully',
      data: result,
    });
  },
);

export const MetaDataControllers = {
  createMetaData,
  getMetaDataById,
  getAllMetaData,
  updateMetaData,
  deleteMetaData,
};
