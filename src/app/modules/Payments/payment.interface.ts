/* eslint-disable no-unused-vars */
export enum PAYMENT_METHOD {
  CARD = 'card',
}

export enum PAYMENT_CURRENCY {
  USD = 'usd',
}

export interface IProceedPaymentPayload {
  price: number;
  user_id?: number;
  order_id?: number;
  order_items?: {
    product_id: number;
    quantity: number;
    price: number;
  }[];
  shipping_info?: {
    recipient_name: string;
    email: string;
    apartment?: string;
    address: string;
    city: string;
    postal_code: string;
    state?: string;
    country: string;
    phone: string;
    carrier?: string;
    delivery_instruction?: string;
  };
  coupon_code?: string;
  campaign_id?: number;
  discount_amount?: number;
  net_amount?: number;
  total_amount?: number;
  free_shipping?: boolean;
}

