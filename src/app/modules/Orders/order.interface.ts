type TOrderItems = {
  product_id: number;
  quantity: number;
  price: number;
}[];

export interface IOrder {
  id: number; // Auto-incremented order ID
  total_amount?: number; // Auto-incremented order ID
  user_id: number; // Foreign key referencing the user table's ID
  order_id: string; // Unique order identifier
  tracking_number: string; // Tracking number for the order
  order_items: TOrderItems;
  shipping_info: {
    name: string;
    email: string;
    phone: string;
    street_address: string;
    apartment?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    deliveryInstruction?: string;
  }; // Shipping information as a JSON object
  payment_info: {
    cardNumber?: string;
    cardExpiry?: string;
    bankAccountNumber?: string;
    paymentGateway?: string;
  }; // Payment information (can vary depending on the method)
  payment_method: 'cash' | 'card' | 'bank' | 'online'; // Payment method enumeration
  status:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'; // Order status
  status_updated_at: string; // Timestamp of when the status was last updated
  delivery_time?: string | null; // Timestamp of when the delivery is expected (nullable)
  notes?: string | null; // Any additional notes for the order (nullable)
  created_at: string; // Timestamp when the order was created
  updated_at: string; // Timestamp when the order was last updated
}

export type TOrderFilterableFields =
  | 'status'
  | 'user_id'
  | 'start_date'
  | 'end_date';
