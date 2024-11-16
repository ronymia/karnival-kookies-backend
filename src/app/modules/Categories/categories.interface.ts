export type TCreateCategoryType = {
  id?: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TUpdateCategoryType = Partial<TCreateCategoryType>;
