import { z } from 'zod';
import { productStatus } from './product.constant';

const createSchema = z.object({
  body: z.object({
    id: z.number({ message: 'Id is required' }).nullable().optional(),
    name: z
      .string({ message: 'Name is required' })
      .min(1, 'Name cannot be empty'),
    description: z
      .string({ message: 'Description is required' })
      .min(10, 'Description must be at least 10 characters long'),
    regular_price: z
      .number({ message: 'Regular price is required' })
      .positive('Regular price must be a positive number'),
    discount_price: z
      .number()
      .positive('Discount price must be a positive number')
      .optional(),
    images: z
      .array(z.string().url('Each image must be a valid URL'), {
        message: 'Images are required',
      })
      .min(1, 'At least one image is required'),
    category_id: z
      .number({ message: 'Category is required' })
      .positive('Category ID Should be Positive number'),
    quantity: z
      .number({ message: 'Quantity is required' })
      .positive('Quantity Should be Positive number'),
    is_discount_enable: z.boolean({
      message: 'Discount Activation is required',
    }),
    status: z.enum([...productStatus] as [string, ...string[]]),
  }),
});

// Define the schema for the request body
const updateSchema = z.object({
  body: z.object({
    id: z.number({ message: 'Id is required' }),
    name: z
      .string({ message: 'Name is required' })
      .min(1, 'Name cannot be empty'),
    description: z
      .string({ message: 'Description is required' })
      .min(10, 'Description must be at least 10 characters long'),
    regular_price: z
      .number({ message: 'Regular price is required' })
      .positive('Regular price must be a positive number'),
    discount_price: z
      .number()
      .positive('Discount price must be a positive number')
      .optional(),
    images: z
      .array(z.string().url('Each image must be a valid URL'), {
        message: 'Images are required',
      })
      .min(1, 'At least one image is required'),
    category_id: z
      .number({ message: 'Category is required' })
      .positive('Category ID Should be Positive number'),
    quantity: z
      .number({ message: 'Quantity is required' })
      .positive('Quantity Should be Positive number'),
    is_discount_enable: z.boolean({
      message: 'Discount Activation is required',
    }),
    status: z.enum([...productStatus] as [string, ...string[]]),
  }),
});

export const ProductValidations = { createSchema, updateSchema };
