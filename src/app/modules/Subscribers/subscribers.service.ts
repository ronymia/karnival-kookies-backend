import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { ISubscribersFilters } from './subscribers.interface';

// CREATE SUBSCRIBERS
const createSubscribers = async (payload: { email: string }): Promise<any> => {
  const subscribed_at = new Date();
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO subscribers (email, subscribed_at) VALUES (?, ?)`,
    [payload?.email, subscribed_at],
  );

  return {
    id: result?.insertId,
    email: payload?.email,
    subscribed_at,
  };
};

// GET ALL SUBSCRIBERS
const getAllSubscribers = async (
  filters: ISubscribersFilters,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  // GET PAGINATION AND SORTING DATA
  const { page, limit, offset, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // BASE QUERY
  let query = `SELECT * FROM subscribers`;

  // DATE FILTER
  if (filters?.date_filter) {
    const { date_filter } = filters;
    let condition = '';

    switch (date_filter) {
      case 'today':
        condition = `DATE(subscribed_at) = CURDATE()`;
        break;
      case 'this_week':
        condition = `YEARWEEK(subscribed_at, 1) = YEARWEEK(NOW(), 1)`;
        break;
      case 'last_week':
        condition = `YEARWEEK(subscribed_at, 1) = YEARWEEK(NOW(), 1) - 1`;
        break;
      case 'this_month':
        condition = `MONTH(subscribed_at) = MONTH(NOW()) AND YEAR(subscribed_at) = YEAR(NOW())`;
        break;
      case 'last_month':
        condition = `MONTH(subscribed_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH)) 
                   AND YEAR(subscribed_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))`;
        break;
      case 'this_year':
        condition = `YEAR(subscribed_at) = YEAR(NOW())`;
        break;
      case 'last_year':
        condition = `YEAR(subscribed_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 YEAR))`;
        break;
      default:
        break;
    }

    if (condition) {
      query += ` WHERE ${condition}`;
    }
  }

  // SORTING
  if (sortBy && sortOrder) {
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
  }

  // PAGINATION
  if (limit) {
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  // EXECUTE QUERY
  const [result] = await pool.query<RowDataPacket[]>(query);

  // TOTAL COUNT
  const [total] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM subscribers`,
  );

  // SEND TO CONTROLLER
  return {
    meta: {
      total: total[0].count,
      page,
      limit,
      total_pages: Math.ceil(total[0].count / Number(limit) || 0),
    },
    data: result,
  };
};

//
export const SubscriberServices = { createSubscribers, getAllSubscribers };
