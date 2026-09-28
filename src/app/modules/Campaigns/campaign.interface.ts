export type TCampaignType =
  | 'discount'
  | 'free_shipping'
  | 'bogo_same'
  | 'bogo_different'
  | 'free_item';

export type TTriggerType = 'automatic' | 'coupon';

export type TDiscountType = 'percent' | 'fixed';

export interface ICampaign {
  id?: number;
  title: string;
  description?: string | null;
  campaign_type: TCampaignType;
  trigger_type: TTriggerType;
  minimum_spend?: number | null;
  buy_product_id?: number | null;
  buy_quantity?: number;
  discount_type?: TDiscountType | null;
  discount_value?: number | null;
  get_product_id?: number | null;
  get_quantity?: number;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  is_active?: boolean;
  max_uses_total?: number | null;
  max_uses_per_user?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface ICartItemForEvaluation {
  product_id: number;
  quantity: number;
  price: number;
}

export interface ICampaignEvaluationPayload {
  cart_items: ICartItemForEvaluation[];
  coupon_code?: string;
  user_id?: number;
}

export interface IFreeItemReward {
  product_id: number;
  quantity: number;
  name?: string;
  image?: string;
}

export interface ICampaignEvaluationResult {
  is_valid: boolean;
  message?: string;
  applied_campaign?: {
    id: number;
    title: string;
    campaign_type: TCampaignType;
    trigger_type: TTriggerType;
    coupon_code?: string;
  } | null;
  net_amount: number;
  discount_amount: number;
  total_amount: number;
  free_shipping: boolean;
  free_items: IFreeItemReward[];
}
