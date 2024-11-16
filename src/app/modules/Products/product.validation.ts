import { z } from 'zod';

const createSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .min(1, 'Name cannot be empty'),
    description: z
      .string({ required_error: 'Description is required' })
      .min(10, 'Description must be at least 10 characters long'),
    regularPrice: z
      .number({ required_error: 'Regular price is required' })
      .positive('Regular price must be a positive number'),
    discountPrice: z
      .number()
      .positive('Discount price must be a positive number')
      .optional(),
    images: z
      .array(z.string().url('Each image must be a valid URL'), {
        required_error: 'Images are required',
      })
      .min(1, 'At least one image is required'),
    category: z
      .string({ required_error: 'Category is required' })
      .min(1, 'Category cannot be empty'),
    inStock: z.boolean({ required_error: 'Stock status is required' }),
  })
  .refine(
    (data) => {
      return !data.discountPrice || data.discountPrice < data.regularPrice;
    },
    {
      message: 'Discount price should be less than the regular price',
      path: ['discountPrice'],
    },
  );

// Define the schema for the request body
const updateSchema = z.object({
  id: z.string().optional(), // Assuming id is optional, adjust as needed
  name: z.string().min(1, { message: 'Name is required' }),
  description: z.string().optional(),
  regularPrice: z
    .number()
    .min(0, { message: 'Valid regular price is required' }),
  discountPrice: z
    .number()
    .min(0, { message: 'Discount price cannot be negative' })
    .optional(),
  images: z
    .array(z.string())
    .min(1, { message: 'At least one image is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  inStock: z.number().min(0, { message: 'Valid stock is required' }),
  createdAt: z.string().optional(), // Assuming createdAt is optional, adjust as needed
});

export const ProductValidations = { createSchema, updateSchema };
