import { z } from 'zod';

const createWebhookSchema = z.object({
  query: z
    .object({
      url: z.string().url('Invalid webhook URL format').optional(),
      events: z.union([z.string(), z.array(z.string())]).optional(),
      description: z.string().optional(),
    })
    .optional(),
  body: z
    .object({
      url: z.string().url('Invalid webhook URL format').optional(),
      enabled_events: z.array(z.string()).optional(),
      description: z.string().optional(),
    })
    .optional(),
});

export const StripeValidations = {
  createWebhookSchema,
};
