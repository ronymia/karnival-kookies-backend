import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    id: z.number().nullable().optional(),
    question: z.string({ message: 'Question is required' }),
    answer: z.string({ message: 'Answer is required' }),
  }),
});

const updateSchema = z.object({
  body: z.object({
    id: z.number({ message: 'ID is Required' }),
    question: z.string({ message: 'Question is required' }),
    answer: z.string({ message: 'Answer is required' }),
  }),
});

export const FaqValidations = { createSchema, updateSchema };
