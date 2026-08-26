import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    id: z.number({ message: 'ID is Required' }).nullable().optional(),
    name: z.string({ message: 'Name is required' }),
    description: z.string().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    id: z.number({ message: 'ID is Required' }),
    name: z.string({ message: 'Name is required' }),
    description: z.string().optional(),
  }),
});

export const CategoryValidations = {
  createSchema,
  updateSchema,
};
