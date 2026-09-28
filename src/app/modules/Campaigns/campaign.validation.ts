import { z } from 'zod';

const createCampaignZodSchema = z.object({
  body: z.object({
    title: z.string({ message: 'Title is required' }),
    description: z.string().optional().nullable(),
    campaign_type: z.enum([
      'discount',
      'free_shipping',
      'bogo_same',
      'bogo_different',
      'free_item',
    ]),
    trigger_type: z.enum(['automatic', 'coupon']).default('automatic'),
    minimum_spend: z.number().nonnegative().optional().nullable(),
    buy_product_id: z.number().int().positive().optional().nullable(),
    buy_quantity: z.number().int().positive().default(1),
    discount_type: z.enum(['percent', 'fixed']).optional().nullable(),
    discount_value: z.number().nonnegative().optional().nullable(),
    get_product_id: z.number().int().positive().optional().nullable(),
    get_quantity: z.number().int().positive().default(1),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    is_active: z.boolean().default(true),
    max_uses_total: z.number().int().positive().optional().nullable(),
    max_uses_per_user: z.number().int().positive().default(1),
    coupon_code: z.string().optional().nullable(),
  }),
});

const updateCampaignZodSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional().nullable(),
    campaign_type: z
      .enum([
        'discount',
        'free_shipping',
        'bogo_same',
        'bogo_different',
        'free_item',
      ])
      .optional(),
    trigger_type: z.enum(['automatic', 'coupon']).optional(),
    minimum_spend: z.number().nonnegative().optional().nullable(),
    buy_product_id: z.number().int().positive().optional().nullable(),
    buy_quantity: z.number().int().positive().optional(),
    discount_type: z.enum(['percent', 'fixed']).optional().nullable(),
    discount_value: z.number().nonnegative().optional().nullable(),
    get_product_id: z.number().int().positive().optional().nullable(),
    get_quantity: z.number().int().positive().optional(),
    start_date: z.string().optional().nullable(),
    end_date: z.string().optional().nullable(),
    is_active: z.boolean().optional(),
    max_uses_total: z.number().int().positive().optional().nullable(),
    max_uses_per_user: z.number().int().positive().optional(),
  }),
});

const evaluateCampaignZodSchema = z.object({
  body: z.object({
    cart_items: z.array(
      z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
        price: z.number().nonnegative(),
      }),
    ),
    coupon_code: z.string().optional(),
    user_id: z.number().int().positive().optional(),
  }),
});

export const CampaignValidations = {
  createCampaignZodSchema,
  updateCampaignZodSchema,
  evaluateCampaignZodSchema,
};
