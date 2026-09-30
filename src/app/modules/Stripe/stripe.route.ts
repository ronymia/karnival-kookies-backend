import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import { StripeControllers } from './stripe.controller';
import validateRequest from '../../middlewares/validateRequest';
import { StripeValidations } from './stripe.validation';

const router = express.Router();

/**
 * @api {get} /api/v1.0/stripe/config Get Stripe Config
 * @apiDescription Returns Stripe publishable key
 */
router.get(
  '/config',
  verifyToken,
  StripeControllers.stripeConfig,
);

/**
 * @api {get} /api/v1.0/stripe/create-webhook Create a Stripe Webhook Endpoint
 * @apiDescription Registers a new webhook endpoint with Stripe for payment_intent events
 * @apiQuery {String} [url] Destination webhook URL (defaults to BACKEND_URL + /api/v1.0/stripe/webhook)
 * @apiQuery {String} [events] Comma-separated event types (defaults to payment_intent.succeeded,payment_intent.payment_failed)
 * @apiQuery {String} [description] Optional description
 */
router.get(
  '/create-webhook',
  validateRequest(StripeValidations.createWebhookSchema),
  StripeControllers.createWebhook,
);

// Also support POST for creating webhook
router.post(
  '/create-webhook',
  validateRequest(StripeValidations.createWebhookSchema),
  StripeControllers.createWebhook,
);

// Aliases for convenience
router.get(
  '/webhook/create',
  validateRequest(StripeValidations.createWebhookSchema),
  StripeControllers.createWebhook,
);

/**
 * @api {get} /api/v1.0/stripe/webhook-endpoints List Webhook Endpoints
 * @apiDescription Lists all configured webhook endpoints in Stripe
 */
router.get('/webhook-endpoints', StripeControllers.listWebhookEndpoints);

/**
 * @api {delete} /api/v1.0/stripe/webhook-endpoints/:id Delete a Webhook Endpoint
 * @apiDescription Deletes a configured webhook endpoint in Stripe by its ID
 */
router.delete('/webhook-endpoints/:id', StripeControllers.deleteWebhookEndpoint);

/**
 * @api {post} /api/v1.0/stripe/webhook Incoming Stripe Webhook Handler
 * @apiDescription Receives events directly from Stripe servers
 */
router.post('/webhook', StripeControllers.handleWebhook);

export const StripeRoutes = router;
