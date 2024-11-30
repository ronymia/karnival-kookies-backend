import Stripe from 'stripe';
import config from '../config';

export const stripe = new Stripe(config.stripe_key as string, {
  apiVersion: '2024-09-30.acacia',
  typescript: true,
});
