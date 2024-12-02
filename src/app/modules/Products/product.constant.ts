import { TProductStatus } from './product.interface';

export const productFilterableFields = [
  'searchTerm',
  'fromPrice',
  'toPrice',
  'sortByNewest',
  'lowToHigh',
  'HighToLow',
  'category_id',
];

export const productStatus: TProductStatus[] = [
  'in-stock',
  'out-of-stock',
  'discontinued',
];
