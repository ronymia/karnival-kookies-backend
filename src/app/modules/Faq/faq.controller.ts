import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { FaqServices } from './faq.service';

// CREATE
const createFaq: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { ...createData } = req.body;

    const result = await FaqServices.createFaq(createData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'FAQ Created successfully',
      data: result,
    });
  },
);

// GET ALL FAQ
const getAllFaq: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, faqFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);

    const result = await FaqServices.getAllFaq();
    res.status(httpStatus.OK).json(result);
    // SEND RESPONSE
    // sendResponse<any>(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: 'FAQ fetch successfully',
    //   data: result,
    // });
  },
);

// UPDATE
const updateFaq: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, faqFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { ...updateData } = req.body;

    const result = await FaqServices.updateFaq(updateData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'FAQ update successfully',
      data: result,
    });
  },
);

// UPDATE
const deleteFaq: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await FaqServices.deleteFaq(Number(id));

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'FAQ delete successfully',
      data: result,
    });
  },
);

export const FaqControllers = { createFaq, getAllFaq, updateFaq, deleteFaq };
