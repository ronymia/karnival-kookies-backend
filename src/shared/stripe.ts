import Stripe from 'stripe';
import { envConfig } from '../config';

export const stripe = new Stripe(envConfig.stripe.key as string, {
  apiVersion: '2024-09-30.acacia',
  typescript: true,
});
