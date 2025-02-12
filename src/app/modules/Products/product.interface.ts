export type TProduct = {
  name: string;
  description: string;
  price: number;
  discount_type: 'fixed' | 'percent'; // Added to support both discount types
  discount_value: number; // Holds the discount amount (fixed value or percentage)
  images: string[];
  category_id: number; // Should be a number since it references an ID
  quantity: number;
  unit: 'kg' | 'litre' | 'pcs' | 'bag';
  is_discount_enable: boolean; // No need for | 0 | 1 since boolean handles it
  status: 'in-stock' | 'out-of-stock' | 'discontinued';
};

export type TProductFilters = {
  searchTerm?: string; // Search by product name or description
  category_id?: number; // Make it optional & ensure it's a number
  fromPrice?: number; // Minimum price filter
  toPrice?: number; // Maximum price filter
  sortBy?: 'newest' | 'lowToHigh' | 'highToLow'; // Unified sorting filter
  inStockOnly?: boolean; // Filter only available stock
};

export type TProductStatus = 'in-stock' | 'out-of-stock' | 'discontinued';
