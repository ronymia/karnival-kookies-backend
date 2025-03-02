import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../../shared/mySQL';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';

// CREATE
const createCoupon = async (payload: any) => {
  const { code, discount_type, discount_value, minimum_spend } = payload;
  // Insert new category
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO coupons (code, discount_type, discount_value, minimum_spend) VALUES (?, ?, ?, ?)',
    [
      code,
      discount_type,
      parseFloat(discount_value),
      parseFloat(minimum_spend),
    ],
  );

  return {
    id: result.insertId,
    code,
    discount_type,
    discount_value: parseFloat(discount_value),
    minimum_spend: parseFloat(minimum_spend),
  };
};

// GET ALL
const getAllCoupons = async (
  filters: any,
  paginationOptions: TPaginationOptions,
) => {
  // DESTRUCTURE
  const { page, limit, offset, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // GENERATE QUERY
  let query = `SELECT * FROM coupons `;

  // GENERATE WHERE QUERY
  let whereQuery = '';
  if (Object.keys(filters).length > 0) {
    whereQuery = Object.keys(filters)
      .map((key) => `${key} = ?`)
      .join(' AND ');
  }

  if (whereQuery) {
    query += ` WHERE ${whereQuery}`;
  }

  // SORT QUERY
  if (sortBy && sortOrder) {
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
  }

  // LIMIT QUERY
  if (limit && page) {
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  // EXECUTE THE QUERY
  const [coupons] = await pool.query<RowDataPacket[]>(query, [
    ...Object.values(filters),
  ]);

  // Get the total count of meta_data entries
  const [totalCouponsResult] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM coupons',
  );

  // SEND TO CONTROLLER
  return {
    meta: {
      current_page: page,
      limit,
      total_pages:
        Math.ceil(totalCouponsResult[0]?.count / limit! || 0) || null,
      total: totalCouponsResult[0]?.count,
    },
    data: coupons,
  };
};

//  GET META DATA BY ID
const getCouponCodeById = async (id: number): Promise<any> => {
  const [result] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM coupons WHERE id = ?',
    [Number(id)],
  );

  return result;
};

//UPDATE
const updateCoupon = async (payload: any) => {
  // EXTRACT
  const { id, code, discount_type, discount_value, minimum_spend } = payload;

  // EXECUTE THE QUERY
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE coupons SET code = ?, discount_type = ?, discount_value = ?, minimum_spend = ? WHERE id = ?',
    [
      code,
      discount_type,
      parseFloat(discount_value),
      parseFloat(minimum_spend),
      id,
    ],
  );

  return result;
};

//DELETE
const deleteCoupon = async (ids: number[]) => {
  // GENERATE PLACEHOLDER FOR QUERY
  const placeholders = ids.map(() => '?');

  // DELETE QUERY
  const query = `DELETE FROM coupons WHERE id IN (${placeholders})`;

  // EXECUTE QUERY
  const [result] = await pool.query<ResultSetHeader>(query, ids);

  return result;
};

//
export const CouponServices = {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  getCouponCodeById,
  deleteCoupon,
};
