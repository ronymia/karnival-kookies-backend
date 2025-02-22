export type TOrderFilterableFields = 'status' | 'user_id' | 'date_filter';

export type TOrderFilter = {
  status?: string;
  user_id?: number;
  date_filter?:
    | 'today'
    | 'this_week'
    | 'this_month'
    | 'this_year'
    | 'last_week'
    | 'last_month'
    | 'last_year';
};
