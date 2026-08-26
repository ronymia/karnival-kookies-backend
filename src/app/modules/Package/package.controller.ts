import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { PackageServices } from './package.service';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { packageFilterableFields } from './package.constant';
import AppError from '../../../errors/AppError';

// CREATE PACKAGE
const createPackage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await PackageServices.createPackage(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Message Created successfully',
      data: result,
    });
  },
);

// GET ALL PACKAGES
const getAllPackages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, packageFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await PackageServices.getAllPackages(
      filters,
      paginationOptions,
    );

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Packages fetch successfully',
      meta: result.meta,
      data: result.data,
    });
  },
);

// GET PACKAGE BY ID
const getPackageById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PackageServices.getPackageById(Number(id));

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Package fetch successfully',
      data: result,
    });
  },
);

// UPDATE PACKAGE
const updatePackage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await PackageServices.updatePackage(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Package update successfully',
      data: result,
    });
  },
);

// UPDATE PACKAGE
const deletePackage: RequestHandler = catchAsync(
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
    const result = await PackageServices.deletePackage(parsedIds);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Package delete successfully',
      data: result,
    });
  },
);

// UPLOAD FILES
const uploadPackageFiles = catchAsync(async (req: Request, res: Response) => {
  // Access the files
  const files = req.files;
  if (!files || files.length === 0) {
    res.status(400).json({ message: 'No files uploaded' });
    return;
  }

  const result = await PackageServices.uploadPackageFiles(files);

  // SEND RESPONSE
  sendResponse<any>(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Package Files uploaded successfully',
    data: result,
  });
});

export const PackageControllers = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  uploadPackageFiles,
};
