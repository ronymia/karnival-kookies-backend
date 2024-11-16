import { z } from 'zod';

const createSchema = z.object({
  code: z.string().min(1, { message: 'Code is required' }),
  discountType: z.enum(['percentage', 'fixed'], {
    message: "Discount type must be 'percentage' or 'fixed'",
  }),
  discountAmount: z
    .number()
    .positive({ message: 'Discount amount must be a positive number' }),
  minimumSpend: z
    .number()
    .nonnegative({ message: 'Minimum spend must be zero or a positive number' })
    .optional(),
});

export const DiscountValidations = { createSchema };
