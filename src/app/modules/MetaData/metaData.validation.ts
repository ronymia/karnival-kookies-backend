import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    id: z.number({ required_error: 'ID is Required' }).nullable().optional(),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    id: z.number({ required_error: 'ID is Required' }),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
  }),
});

export const MetaDataValidations = {
  createSchema,
  updateSchema,
};
