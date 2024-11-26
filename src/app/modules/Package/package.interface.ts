export interface IPackage {
  id?: number;
  name: string;
  description?: string;
  regularPrice: number;
  discountPrice?: number;
  isDiscountEnable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
