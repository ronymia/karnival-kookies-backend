import { z } from 'zod';

const createSchema = z.object({
  productId: z.string().min(1, { message: 'Product ID is required' }),
  email: z.string().email({ message: 'Invalid email format' }),
  rating: z
    .number()
    .int()
    .min(1, { message: 'Rating must be at least 1' })
    .max(5, { message: 'Rating cannot exceed 5' }),
  comment: z.string().optional(),
});

export const RatingValidations = { createSchema };
