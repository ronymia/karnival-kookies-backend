import config from '../../../config';
import { stripe } from '../../../shared/stripe';
import { PAYMENT_CURRENCY, PAYMENT_METHOD } from './payment.interface';

// STRIPE CONFIG
const stripeConfig = async () => {
  const stripeKey = config.stripe_public_key;
  return { publishableKey: stripeKey };
};

// PAYMENT INTENT
const paymentIntent = async (payload: any) => {
  const { price } = payload;
  const amount = parseInt(price) * 100;
  if (!amount) {
    return;
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: PAYMENT_CURRENCY.usd,
    payment_method_types: [PAYMENT_METHOD.cart],
  });
  //   console.log(paymentIntent);
  return {
    clientSecret: paymentIntent.client_secret,
  };
};

//
export const PaymentServices = { stripeConfig, paymentIntent };
