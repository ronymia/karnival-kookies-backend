import Stripe from 'stripe';

export interface ICreateWebhookPayload {
  url?: string;
  enabled_events?: Stripe.WebhookEndpointCreateParams.EnabledEvent[];
  description?: string;
}
