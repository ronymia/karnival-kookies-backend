import { z } from 'zod';

const createSchema = z.object({
  question: z.string().min(1, { message: 'Question is required' }),
  answer: z.string().min(1, { message: 'Answer is required' }),
});

export const FaqValidations = { createSchema };
