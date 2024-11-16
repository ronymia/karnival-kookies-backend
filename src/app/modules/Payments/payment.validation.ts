import { z } from 'zod';

const createSchema = z.object({
  price: z.number().int().positive('Price must be a positive integer'),
});

//
export const PaymentValidations = { createSchema };
