import { Request, RequestHandler, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { StripeServices } from './stripe.service';
import { handleWebhook as handleWebhookService } from './stripe.webhook';
import Stripe from 'stripe';

/**
 * GET or POST /api/v1.0/stripe/create-webhook
 * Query or body options:
 * - url: custom webhook url (defaults to BACKEND_URL/api/v1.0/payments/webhook)
 * - events: comma-separated list or array of events (defaults to payment_intent.succeeded, payment_intent.payment_failed)
 * - description: optional endpoint description
 */
const createWebhook: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const queryUrl = (req.query.url as string) || (req.body?.url as string);
    const queryEvents = req.query.events || req.body?.enabled_events;

    let enabledEvents: Stripe.WebhookEndpointCreateParams.EnabledEvent[] | undefined;
    if (queryEvents) {
      if (Array.isArray(queryEvents)) {
        enabledEvents = queryEvents as Stripe.WebhookEndpointCreateParams.EnabledEvent[];
      } else if (typeof queryEvents === 'string') {
        enabledEvents = queryEvents
          .split(',')
          .map((e) => e.trim()) as Stripe.WebhookEndpointCreateParams.EnabledEvent[];
      }
    }

    const description = (req.query.description as string) || req.body?.description;

    const result = await StripeServices.createWebhookEndpoint({
      url: queryUrl,
      enabled_events: enabledEvents,
      description,
    });

    sendResponse<any>(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Stripe webhook endpoint created successfully',
      data: result,
    });
  },
);

/**
 * GET /api/v1.0/stripe/webhook-endpoints
 */
const listWebhookEndpoints: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StripeServices.listWebhookEndpoints();

    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stripe webhook endpoints fetched successfully',
      data: result,
    });
  },
);

/**
 * DELETE /api/v1.0/stripe/webhook-endpoints/:id
 */
const deleteWebhookEndpoint: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await StripeServices.deleteWebhookEndpoint(id as string);

    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stripe webhook endpoint deleted successfully',
      data: result,
    });
  },
);

/**
 * POST /api/v1.0/stripe/webhook
 * Handles incoming Stripe webhook events
 */
const handleWebhook: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const signature = req.headers['stripe-signature'] as string;
    const rawBody = (req as any).rawBody || req.body;

    const result = await handleWebhookService(rawBody, signature);

    res.status(httpStatus.OK).json(result);
  },
);

/**
 * GET /api/v1.0/stripe/config
 * Returns Stripe publishable key
 */
const stripeConfig: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StripeServices.stripeConfig();

    sendResponse<any>(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Stripe publishableKey fetch successfully',
      data: result,
    });
  },
);

export const StripeControllers = {
  stripeConfig,
  createWebhook,
  listWebhookEndpoints,
  deleteWebhookEndpoint,
  handleWebhook,
};
