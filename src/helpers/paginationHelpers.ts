type TOptions = {
  page?: number;
  perPage?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
};

type TPaginationResult = {
  page: number;
  perPage?: number;
  limit?: number;
  skip: number;
  offset: number;
  sortBy: string;
  sortOrder: string;
};

const calculatePagination = (options: TOptions): TPaginationResult => {
  const page = Number(options.page) || 1;
  const perPage = Number(options.perPage) || 10;
  const limit = Number(options.limit) || 10;
  const skip = (page - 1) * perPage;
  const offset = (page - 1) * limit;

  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  return {
    page,
    perPage,
    limit,
    skip,
    offset,
    sortBy,
    sortOrder,
  };
};

export const paginationHelpers = { calculatePagination };
