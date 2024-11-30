import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    price: z.number().positive('Price must be a positive'),
  }),
});

//
export const PaymentValidations = { createSchema };
