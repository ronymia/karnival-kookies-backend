import Stripe from 'stripe';
import { envConfig } from './index';

export const stripe = new Stripe(envConfig.stripe.key as string, {
  apiVersion: '2026-07-29.dahlia',
  typescript: true,
});
