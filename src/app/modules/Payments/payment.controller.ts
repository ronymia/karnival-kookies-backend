import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { PaymentServices } from './payment.service';

// STRIPE CONFIG
const stripeConfig: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // const { ...cartData } = req.body;

    const result = await PaymentServices.stripeConfig();

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stripe Config Updated successfully',
      data: result,
    });
  },
);

// PAYMENT INTENT
const paymentIntent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    const result = await PaymentServices.paymentIntent(payloadData);

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Payment Success successfully',
      data: result,
    });
  },
);

export const PaymentControllers = { stripeConfig, paymentIntent };
