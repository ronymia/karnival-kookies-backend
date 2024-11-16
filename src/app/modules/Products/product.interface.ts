export type TProduct = {
  name: string;
  description: string;
  regularPrice: number;
  discountPrice: number;
  images: string;
  category: string;
  inStock: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TProductFilters = {
  searchTerm?: string;
  category: string;
  sortByNewest: string;
  fromPrice: number;
  toPrice: number;
};
