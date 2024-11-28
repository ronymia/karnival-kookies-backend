export interface IPackage {
  id?: number;
  name: string;
  description?: string;
  regularPrice: number;
  discountPrice?: number;
  inStock?: number;
  is_active: 0 | 1;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
