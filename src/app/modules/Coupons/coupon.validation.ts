import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    id: z.number().nullable().optional(),
    code: z.string({ required_error: 'Code is required' }),
    CouponType: z.enum(['percentage', 'fixed'], {
      message: "Coupon type must be 'percentage' or 'fixed'",
    }),
    CouponAmount: z
      .number({
        required_error: 'Coupon is Required',
      })
      .positive({ message: 'Coupon amount must be a positive number' }),
    minimumSpend: z
      .number({
        required_error: 'Minimum Spend Field is Required',
      })
      .positive({ message: 'Minimum spend must be zero or a positive number' }),
  }),
});

const updateSchema = z.object({
  body: z.object({
    id: z.number({ required_error: 'ID Is Required' }),
    code: z.string({ required_error: 'Code is required' }),
    CouponType: z.enum(['percentage', 'fixed'], {
      message: "Coupon type must be 'percentage' or 'fixed'",
    }),
    CouponAmount: z
      .number({
        required_error: 'Coupon is Required',
      })
      .positive({ message: 'Coupon amount must be a positive number' }),
    minimumSpend: z
      .number({
        required_error: 'Minimum Spend Field is Required',
      })
      .positive({ message: 'Minimum spend must be zero or a positive number' })
      .optional(),
  }),
});

export const CouponValidations = { createSchema, updateSchema };
