import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { PaymentServices } from './payment.service';

// STRIPE CONFIG
const stripeConfig: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    // GET RESULT FROM SERVICE
    const result = await PaymentServices.stripeConfig();

    // SEND RESPONSE
    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stripe publishableKey fetch successfully',
      data: result,
    });
  },
);

// PAYMENT INTENT
const paymentIntent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { ...payloadData } = req.body;

    // GET RESULT FROM SERVICE
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

// HANDLE STRIPE WEBHOOK
const handleWebhook: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody || req.body;

    const result = await PaymentServices.handleWebhook(rawBody, signature);

    res.status(httpStatus.OK).json(result);
  },
);

export const PaymentControllers = {
  stripeConfig,
  paymentIntent,
  proceedPayment,
  handleWebhook,
};
