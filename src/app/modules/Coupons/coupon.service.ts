import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { mysqlcreateConnection as pool } from '../../../config';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';

// CREATE
const createCoupon = async (payload: any) => {
  const {
    campaign_id,
    code,
    discount_type,
    discount_value,
    minimum_spend,
    is_active = true,
  } = payload;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO coupons (campaign_id, code, discount_type, discount_value, minimum_spend, is_active) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      campaign_id || null,
      code.trim().toUpperCase(),
      discount_type || null,
      discount_value !== undefined && discount_value !== null ? parseFloat(discount_value) : null,
      minimum_spend !== undefined && minimum_spend !== null ? parseFloat(minimum_spend) : null,
      is_active,
    ],
  );

  return {
    id: result.insertId,
    campaign_id,
    code: code.trim().toUpperCase(),
    discount_type,
    discount_value,
    minimum_spend,
    is_active,
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
  let query = `
    SELECT cp.*,
           c.title as campaign_title,
           c.campaign_type,
           c.trigger_type,
           c.start_date as campaign_start_date,
           c.end_date as campaign_end_date,
           c.is_active as campaign_active
    FROM coupons cp
    LEFT JOIN campaigns c ON cp.campaign_id = c.id
  `;

  // GENERATE WHERE QUERY
  const conditions: string[] = [];
  const queryParams: any[] = [];

  if (filters.code) {
    conditions.push(`cp.code LIKE ?`);
    queryParams.push(`%${filters.code}%`);
  }
  if (filters.campaign_id) {
    conditions.push(`cp.campaign_id = ?`);
    queryParams.push(filters.campaign_id);
  }
  if (filters.is_active !== undefined) {
    conditions.push(`cp.is_active = ?`);
    queryParams.push(filters.is_active);
  }

  if (conditions.length > 0) {
    query += ` WHERE ${conditions.join(' AND ')}`;
  }

  // SORT QUERY
  if (sortBy && sortOrder) {
    query += ` ORDER BY cp.${sortBy} ${sortOrder}`;
  } else {
    query += ` ORDER BY cp.created_at DESC`;
  }

  // LIMIT QUERY
  if (limit && page) {
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), offset);
  }

  // EXECUTE THE QUERY
  const [coupons] = await pool.query<RowDataPacket[]>(query, queryParams);

  // Get total count
  const countQueryParams = queryParams.slice(0, queryParams.length - (limit && page ? 2 : 0));
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const [totalCouponsResult] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM coupons cp ${whereClause}`,
    countQueryParams,
  );

  // SEND TO CONTROLLER
  return {
    meta: {
      current_page: Number(page),
      limit: Number(limit),
      total_pages: Math.ceil((totalCouponsResult[0]?.count || 0) / Number(limit)) || null,
      total: totalCouponsResult[0]?.count || 0,
    },
    data: coupons,
  };
};

// GET BY ID
const getCouponCodeById = async (id: number): Promise<any> => {
  const [result] = await pool.query<RowDataPacket[]>(
    `SELECT cp.*,
            c.title as campaign_title,
            c.campaign_type,
            c.trigger_type,
            c.start_date as campaign_start_date,
            c.end_date as campaign_end_date,
            c.is_active as campaign_active
     FROM coupons cp
     LEFT JOIN campaigns c ON cp.campaign_id = c.id
     WHERE cp.id = ?`,
    [Number(id)],
  );

  return result[0] || null;
};

// UPDATE
const updateCoupon = async (payload: any) => {
  const { id, campaign_id, code, discount_type, discount_value, minimum_spend, is_active } = payload;

  const fields: string[] = [];
  const values: any[] = [];

  if (code !== undefined) {
    fields.push('code = ?');
    values.push(code.trim().toUpperCase());
  }
  if (campaign_id !== undefined) {
    fields.push('campaign_id = ?');
    values.push(campaign_id);
  }
  if (discount_type !== undefined) {
    fields.push('discount_type = ?');
    values.push(discount_type);
  }
  if (discount_value !== undefined) {
    fields.push('discount_value = ?');
    values.push(discount_value !== null ? parseFloat(discount_value) : null);
  }
  if (minimum_spend !== undefined) {
    fields.push('minimum_spend = ?');
    values.push(minimum_spend !== null ? parseFloat(minimum_spend) : null);
  }
  if (is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(is_active);
  }

  if (fields.length > 0) {
    values.push(id);
    await pool.query(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  return await getCouponCodeById(id);
};

// DELETE
const deleteCoupon = async (ids: number[]) => {
  const placeholders = ids.map(() => '?');
  const query = `DELETE FROM coupons WHERE id IN (${placeholders})`;
  const [result] = await pool.query<ResultSetHeader>(query, ids);
  return result;
};

export const CouponServices = {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  getCouponCodeById,
  deleteCoupon,
};
