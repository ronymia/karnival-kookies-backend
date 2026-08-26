import { envConfig } from '../../../config';
import { stripe } from '../../../config/stripe.config';
import { PAYMENT_CURRENCY, PAYMENT_METHOD } from './payment.interface';

// STRIPE CONFIG
const stripeConfig = async () => {
  const stripeKey = envConfig.stripe.public_key;
  return { publishableKey: stripeKey };
};

// PAYMENT INTENT
const paymentIntent = async (payload: { price: number }) => {
  //
  const { price } = payload;

  // IF PRICE IS EMPTY
  if (!price) {
    return;
  }

  // CREATE PAYMENT INTENT
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price,
    currency: PAYMENT_CURRENCY.USD,
    payment_method_types: [PAYMENT_METHOD.CARD],
    // automatic_payment_methods: {
    //   enabled: true,
    // },
  });

  return {
    clientSecret: paymentIntent?.client_secret,
  };
};

//
export const PaymentServices = { stripeConfig, paymentIntent };
