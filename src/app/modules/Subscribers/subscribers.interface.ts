export type TSubscribers = 'email' | 'date_filter' | 'searchTerm';

type date_filter =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'this_year'
  | 'last_week'
  | 'last_month'
  | 'last_year';

export type ISubscribersFilters = {
  searchTerm?: string;
  date_filter?: date_filter;
  email?: string;
};
