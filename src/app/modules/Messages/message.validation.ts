import { z } from 'zod';

const createSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name should not exceed 50 characters'),
  email: z
    .string()
    .email('Invalid email address')
    .max(100, 'Email should not exceed 100 characters'),
  message: z
    .string()
    .min(10, 'Message should be at least 10 characters long')
    .max(500, 'Message should not exceed 500 characters'),
});

export const MessageZodValidations = { createSchema };
