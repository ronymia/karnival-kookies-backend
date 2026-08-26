import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    id: z.number({ message: 'ID is Required' }).nullable().optional(),
    meta_key: z.string({ message: 'Meta Key is required' }),
    title: z.string({ message: 'Title is required' }),
    description: z.string().optional(),
  }),
});

const updateSchema = z.object({
  body: z.object({
    id: z.number({ message: 'ID is Required' }),
    meta_key: z.string({ message: 'Meta Key is required' }),
    title: z.string({ message: 'Title is required' }),
    description: z.string().optional(),
  }),
});

export const MetaDataValidations = {
  createSchema,
  updateSchema,
};
