import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { MessageServices } from './message.service';
import pick from '../../../shared/pick';
import { paginationFields } from '../../../constants/pagination';
import { messageFilterableFields } from './message.constant';

// CREATE
const createMessage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { ...createData } = req.body;

    const result = await MessageServices.createMessage(createData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Message Created successfully',
      data: result,
    });
  },
);

// GET ALL
const getAllMessages: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, messageFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await MessageServices.getAllMessages(
      filters,
      paginationOptions,
    );

    res.status(200).json(result);
    // SEND RESPONSE
    // sendResponse<any>(res, {
    //   statusCode: httpStatus.OK,
    //   success: true,
    //   message: 'Message fetch successfully',
    //   data: result,
    // });
  },
);

// DELETE
const deleteMessage: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const filters = pick(req.query, productFilterableFields);
    // const paginationOptions = pick(req.query, paginationFields);
    const { id } = req.params;

    const result = await MessageServices.deleteMessage(id);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Message Deleted successfully',
      data: result,
    });
  },
);

export const MessageControllers = {
  createMessage,
  getAllMessages,
  deleteMessage,
};
