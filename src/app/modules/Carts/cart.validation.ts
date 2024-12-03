import { z } from 'zod';

const createSchema = z.object({
  body: z.object({
    product_id: z
      .number({ required_error: 'Product ID is required' })
      .int()
      .nonnegative('Product can not be Negative Number'),
    email: z.string().email('Invalid email format'),
    quantity: z
      .number({ required_error: 'Quantity is required' })
      .int()
      .positive('Quantity must be a positive integer'),
  }),
});

// Define the checkoutInfo schema
const checkoutInfoSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  streetAddress: z.string().min(1, { message: 'Street is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  state: z.string().min(1, { message: 'State is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  phone: z.string().min(1, { message: 'Phone is required' }),
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email('Invalid email format'),
});

// Define the main payload schema
const checkOutSchema = z.object({
  body: z.object({
    userName: z.string().min(1, { message: 'Username is required' }),
    userEmail: z
      .string()
      .min(1, { message: 'Email is required' })
      .email('Invalid email format'),
    checkoutInfo: checkoutInfoSchema,
    paymentInfo: z.array(z.any()).nonempty('Payment info is required'), // Adjust the schema as needed for `paymentInfo`
    paymentMethod: z.string().min(1, { message: 'Payment method is required' }),
    totalPayableAmount: z
      .number()
      .positive('Total payable amount must be a positive number'),
    status: z.string().min(1, { message: 'Status is required' }),
  }),
});

//
export const CartValidations = { createSchema, checkOutSchema };
