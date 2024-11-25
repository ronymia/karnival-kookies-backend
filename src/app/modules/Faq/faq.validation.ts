import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    id: z.number().nullable().optional(),
    question: z.string({ required_error: 'Question is required' }),
    answer: z.string({ required_error: 'Answer is required' }),
  }),
});

const updateSchema = z.object({
  body: z.object({
    id: z.number({ required_error: 'ID is Required' }),
    question: z.string({ required_error: 'Question is required' }),
    answer: z.string({ required_error: 'Answer is required' }),
  }),
});

export const FaqValidations = { createSchema, updateSchema };
