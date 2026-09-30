import httpStatus from 'http-status';
import { envConfig } from '../../../config';
import { stripe } from '../../../config/stripe.config';
import AppError from '../../../errors/AppError';
import { serverLogger } from '../../../shared/logger';
import { DEFAULT_WEBHOOK_EVENTS } from './stripe.constant';
import { ICreateWebhookPayload } from './stripe.interface';

/**
 * Resolves the webhook URL to use.
 * Order of precedence:
 * 1. Explicitly provided payload/query URL
 * 2. BACKEND_URL from environment + '/api/v1.0/payments/webhook'
 */
const resolveWebhookUrl = (providedUrl?: string): string => {
  if (providedUrl && providedUrl.trim().length > 0) {
    return providedUrl.trim();
  }

  const backendUrl = envConfig.url.backend;
  if (backendUrl && backendUrl.trim().length > 0) {
    return `${backendUrl.replace(/\/+$/, '')}/api/v1.0/stripe/webhook`;
  }

  throw new AppError(
    httpStatus.BAD_REQUEST,
    'Webhook URL is required. Please provide ?url=https://your-domain/api/v1.0/stripe/webhook or configure BACKEND_URL in .env',
  );
};

/**
 * Create a new webhook endpoint in Stripe.
 */
const createWebhookEndpoint = async (payload: ICreateWebhookPayload = {}) => {
  const webhookUrl = resolveWebhookUrl(payload.url);

  if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Invalid webhook URL. It must start with http:// or https://',
    );
  }

  const enabled_events =
    payload.enabled_events && payload.enabled_events.length > 0
      ? payload.enabled_events
      : DEFAULT_WEBHOOK_EVENTS;

  serverLogger.info(`Creating Stripe webhook endpoint for URL: ${webhookUrl}`);

  try {
    const webhookEndpoint = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events,
      description: payload.description || 'Karnival Kookies Webhook Endpoint',
    });

    serverLogger.info(
      `Stripe webhook endpoint created successfully: ${webhookEndpoint.id} (${webhookEndpoint.url})`,
    );

    return webhookEndpoint;
  } catch (err: any) {
    serverLogger.error(
      `Failed to create Stripe webhook endpoint: ${err.message}`,
    );
    throw new AppError(
      err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      err.message || 'Failed to create Stripe webhook endpoint',
    );
  }
};

/**
 * List all existing webhook endpoints in Stripe.
 */
const listWebhookEndpoints = async () => {
  try {
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
    return endpoints.data;
  } catch (err: any) {
    serverLogger.error(
      `Failed to list Stripe webhook endpoints: ${err.message}`,
    );
    throw new AppError(
      err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      err.message || 'Failed to list Stripe webhook endpoints',
    );
  }
};

/**
 * Delete a webhook endpoint in Stripe.
 */
const deleteWebhookEndpoint = async (id: string) => {
  if (!id) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Webhook endpoint ID is required');
  }

  try {
    const deleted = await stripe.webhookEndpoints.del(id);
    return deleted;
  } catch (err: any) {
    serverLogger.error(
      `Failed to delete Stripe webhook endpoint: ${err.message}`,
    );
    throw new AppError(
      err.statusCode || httpStatus.INTERNAL_SERVER_ERROR,
      err.message || 'Failed to delete Stripe webhook endpoint',
    );
  }
};

/**
 * Stripe configuration (publishable key)
 */
const stripeConfig = async () => {
  const stripeKey = envConfig.stripe.public_key;
  return { publishableKey: stripeKey };
};

export const StripeServices = {
  stripeConfig,
  createWebhookEndpoint,
  listWebhookEndpoints,
  deleteWebhookEndpoint,
};
