export type TMeta = {
  limit: number;
  page: number;
  total: number;
  queryTotal?: number;
  totalPage?: number;
};

export type TApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string | null;
  meta?: TMeta;
  data: T | null;
};

export type TGenericResponse<T> = {
  meta?: TMeta;
  data: T;
};
