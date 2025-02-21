import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../../shared/mySQL';

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

//GET ALL
const getAllCoupons = async () => {
  // Fetch all
  const [Coupons] = await pool.query<RowDataPacket[]>('SELECT * FROM coupons');
  // Fetch total category count
  const [totalCouponsResult] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM coupons',
  );
  const totalCoupons = totalCouponsResult[0].count;
  //SEND TO CONTROLLER
  return {
    meta: {
      current_page: 1,
      limit: 10,
      total_pages: Math.ceil(totalCoupons / 10),
      total: totalCoupons,
    },
    data: Coupons,
  };
};

//UPDATE
const updateCoupon = async (payload: any) => {
  const { id, code, CouponType, CouponAmount, minimumSpend } = payload;
  const [result] = (await pool.query(
    'UPDATE Coupon SET code = ?, CouponType = ?, CouponAmount = ?, minimumSpend = ? WHERE id = ?',
    [code, CouponType, parseFloat(CouponAmount), parseFloat(minimumSpend), id],
  )) as any[];

  return result;
};

//DELETE
const deleteCoupon = async (id: any) => {
  const result = await pool.query('DELETE FROM Coupon WHERE id = ?', [
    Number(id),
  ]);
  return result;
};

//
export const CouponServices = {
  createCoupon,
  updateCoupon,
  getAllCoupons,
  deleteCoupon,
};
