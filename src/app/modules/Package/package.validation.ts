import { z } from 'zod';
import { productStatus } from '../Products/product.constant';

const createSchema = z.object({
  body: z.object({
    id: z.number().nullable().optional(),
    name: z.string().min(1, 'Name cannot be empty'),
    description: z.string({ message: 'Description is required' }),
    price: z.number().positive('Regular price must be a positive number'),
    is_discount_enable: z.preprocess(
      (val) => val === 1 || val === true, // Convert 1 and true to true, everything else to false
      z.boolean(),
    ),
    discount_type: z.enum(['percentage', 'fixed']).optional(),
    discount_value: z.number().optional(),
    images: z
      .array(z.string().url('Each image must be a valid URL'))
      .min(1, 'At least one image is required'),
    quantity: z.number().positive('Quantity Should be a Positive number'),
    unit: z.enum(['kg', 'litre', 'pcs', 'bag']),
    status: z.enum([...productStatus] as [string, ...string[]]),
  }),
  // .superRefine((data, ctx) => {
  //   if (data.is_discount_enable) {
  //     if (!data.discount_type) {
  //       ctx.addIssue({
  //         code: z.ZodIssueCode.custom,
  //         message: 'Discount type is required when discount is enabled',
  //         path: ['discount_type'],
  //       });
  //     }
  //     if (!data.discount_value) {
  //       ctx.addIssue({
  //         code: z.ZodIssueCode.custom,
  //         message: 'Discount value is required when discount is enabled',
  //         path: ['discount_value'],
  //       });
  //     }
  //   }
  // }),
});

// Define the schema for the request body
const updateSchema = z.object({
  body: z
    .object({
      id: z.number({ message: 'Id is required' }),
      name: z
        .string({ message: 'Name is required' })
        .min(1, 'Name cannot be empty'),
      description: z
        .string({ message: 'Description is required' })
        .min(10, 'Description must be at least 10 characters long'),
      price: z
        .number({ message: 'Regular price is required' })
        .positive('Regular price must be a positive number'),
      is_discount_enable: z.boolean({
        message: 'Discount Activation is required',
      }),
      discount_type: z
        .enum(['percentage', 'fixed'], {
          message: "Discount type must be 'percentage' or 'fixed'",
        })
        .optional(), // Optional by default
      discount_value: z
        .number({
          message: 'Discount is Required',
        })
        .optional(), // Optional by default
      images: z
        .array(z.string().url('Each image must be a valid URL'), {
          message: 'Images are required',
        })
        .min(1, 'At least one image is required'),
      quantity: z
        .number({ message: 'Quantity is required' })
        .positive('Quantity Should be Positive number'),
      unit: z.enum(['kg', 'litre', 'pcs', 'bag'], {
        message: 'Unit is required',
      }),
      status: z.enum([...productStatus] as [string, ...string[]]),
    })
    .superRefine((data, ctx) => {
      // Conditional validation for discount fields
      if (data.is_discount_enable) {
        if (!data.discount_type) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Discount type is required when discount is enabled',
            path: ['discount_type'],
          });
        }
        if (!data.discount_value) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Discount value is required when discount is enabled',
            path: ['discount_value'],
          });
        }
      }
    }),
});

export const PackageValidations = { createSchema, updateSchema };
