import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { PaymentServices } from './payment.service';

// PROCEED PAYMENT (OPTION B)
const proceedPayment: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    if (!payload.user_id && req.user?.id) {
      payload.user_id = req.user.id;
    }

    const result = await PaymentServices.proceedPayment(payload);

    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Payment proceeded successfully',
      data: result,
    });
  },
);

export const PaymentControllers = {
  proceedPayment,
};
