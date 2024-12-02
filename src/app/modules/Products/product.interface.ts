export type TProduct = {
  name: string;
  description: string;
  regular_price: number;
  discount_price: number;
  images: string;
  category_id: string;
  quantity: number;
  is_discount_enable: boolean | 0 | 1;
  status: 'in-stock' | 'out-of-stock' | 'discontinued';
};

export type TProductFilters = {
  searchTerm?: string;
  category_id: string;
  sortByNewest: string;
  fromPrice: number;
  toPrice: number;
  lowToHigh: number;
  HighToLow: number;
};

export type TProductStatus = 'in-stock' | 'out-of-stock' | 'discontinued';
