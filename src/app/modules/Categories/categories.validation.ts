import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    id: z.number({ required_error: 'ID is Required' }).nullable().optional(),
    name: z.string({ required_error: 'Name is required' }),
    description: z.string().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    id: z.number({ required_error: 'ID is Required' }),
    name: z.string({ required_error: 'Name is required' }),
    description: z.string().optional(),
  }),
});

export const CategoryValidations = {
  createSchema,
  updateSchema,
};
