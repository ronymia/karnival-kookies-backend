import { z } from 'zod';

const createSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
});

export const CategoryValidations = {
  createSchema,
  updateSchema,
};
