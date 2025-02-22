import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    id: z.number({ required_error: 'ID is Required' }).nullable().optional(),
    meta_key: z.string({ required_error: 'Meta Key is required' }),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    id: z.number({ required_error: 'ID is Required' }),
    meta_key: z.string({ required_error: 'Meta Key is required' }),
    title: z.string({ required_error: 'Title is required' }),
    description: z.string().optional(),
  }),
});

export const MetaDataValidations = {
  createSchema,
  updateSchema,
};
