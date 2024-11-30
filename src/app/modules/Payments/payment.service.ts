import config from '../../../config';
import { stripe } from '../../../shared/stripe';
import { PAYMENT_CURRENCY, PAYMENT_METHOD } from './payment.interface';

// STRIPE CONFIG
const stripeConfig = async () => {
  const stripeKey = config.stripe_public_key;
  return { publishableKey: stripeKey };
};

// PAYMENT INTENT
const paymentIntent = async (payload: { price: number }) => {
  const { price } = payload;
  const amount = Number(price) * 100;
  if (!amount) {
    return;
  }
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: PAYMENT_CURRENCY.USD,
    payment_method_types: [PAYMENT_METHOD.CARD],
    // automatic_payment_methods: {
    //   enabled: true,
    // },
  });
  //   console.log(paymentIntent);
  return {
    clientSecret: paymentIntent?.client_secret,
  };
};

//
export const PaymentServices = { stripeConfig, paymentIntent };
