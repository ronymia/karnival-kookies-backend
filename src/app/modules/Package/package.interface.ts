export interface IPackage {
  id?: number;
  name: string;
  description: string;
  price: number;
  is_discount_enable: boolean;
  discount_type: 'fixed' | 'percent';
  discount_value: number;
  images: string[];
  quantity: number;
  unit: 'kg' | 'litre' | 'pcs' | 'bag';
  status: 'in-stock' | 'out-of-stock' | 'discontinued';
}
