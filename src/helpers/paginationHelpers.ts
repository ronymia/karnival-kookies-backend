type TOptions = {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: string;
};

type TPaginationResult = {
  page: number;
  perPage: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

const calculatePagination = (options: TOptions): TPaginationResult => {
  const page = Number(options.page) || 1;
  const perPage = Number(options.perPage) || 10;
  const skip = (page - 1) * perPage;

  const sortBy = options.sortBy || 'createdAt';
  const sortOrder = options.sortOrder || 'desc';

  return {
    page,
    perPage,
    skip,
    sortBy,
    sortOrder,
  };
};

export const paginationHelpers = { calculatePagination };
