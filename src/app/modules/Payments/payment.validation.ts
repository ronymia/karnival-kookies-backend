import { z } from 'zod';

const orderItemSchema = z.object({
  product_id: z
    .union([z.number(), z.string().transform(Number)])
    .optional()
    .nullable(),
  quantity: z
    .union([z.number(), z.string().transform(Number)])
    .optional()
    .nullable(),
  price: z
    .union([z.number(), z.string().transform(Number)])
    .optional()
    .nullable(),
});

const shippingInfoSchema = z
  .object({
    recipient_name: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    apartment: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    postal_code: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    country: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    carrier: z.string().optional().nullable(),
    delivery_instruction: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
  })
  .optional()
  .nullable();

const proceedPaymentSchema = z.object({
  body: z.object({
    price: z
      .union(
        [
          z.number({ message: 'Price is required' }),
          z.string({ message: 'Price is required' }).transform(Number),
        ],
        { message: 'Price is required' },
      )
      .refine((val) => !Number.isNaN(val) && val >= 0.5, {
        message: 'Amount must be at least $0.50 USD',
      }),
    user_id: z
      .union([z.number(), z.string().transform(Number)])
      .optional()
      .nullable(),
    order_id: z
      .union([z.number(), z.string().transform(Number)])
      .optional()
      .nullable(),
    order_items: z.array(orderItemSchema).optional().nullable(),
    shipping_info: shippingInfoSchema,
    coupon_code: z.string().optional().nullable(),
    campaign_id: z
      .union([z.number(), z.string().transform(Number)])
      .optional()
      .nullable(),
    discount_amount: z
      .union([z.number(), z.string().transform(Number)])
      .optional()
      .nullable(),
    net_amount: z
      .union([z.number(), z.string().transform(Number)])
      .optional()
      .nullable(),
    total_amount: z
      .union([z.number(), z.string().transform(Number)])
      .optional()
      .nullable(),
    free_shipping: z
      .union([z.boolean(), z.number(), z.string()])
      .optional()
      .nullable(),
  }),
});

export const PaymentValidations = {
  proceedPaymentSchema,
  createSchema: proceedPaymentSchema,
};

