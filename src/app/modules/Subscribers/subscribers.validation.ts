import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email({ message: 'Please Provide Valid Email Address' }),
  }),
});

export const SubscribersValidations = { createSchema };
