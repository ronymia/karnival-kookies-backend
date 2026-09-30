import Stripe from 'stripe';

export const DEFAULT_WEBHOOK_EVENTS: Stripe.WebhookEndpointCreateParams.EnabledEvent[] = [
  'payment_intent.succeeded',
  'payment_intent.payment_failed',
];
