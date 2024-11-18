import { pool } from '../../../shared/mySQL';

// CREATE
const createDiscount = async (payload: any) => {
  const { code, discountType, discountAmount, minimumSpend } = payload;
  // Insert new category
  const [result] = (await pool.query(
    'INSERT INTO discount (code, discountType, discountAmount, minimumSpend, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [
      code,
      discountType,
      parseFloat(discountAmount),
      parseFloat(minimumSpend),
      new Date(),
      new Date(),
    ],
  )) as any[];
  const newDiscountCode = {
    id: result.insertId,
    code,
    discountType,
    discountAmount: parseFloat(discountAmount),
    minimumSpend: parseFloat(minimumSpend),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newDiscountCode;
};

//GET ALL
const getAllDiscounts = async () => {
  // Fetch all
  const [discounts] = await pool.query('SELECT * FROM discount');
  // Fetch total category count
  const [totalDiscountsResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM discount',
  )) as any[];
  const totalDiscounts = totalDiscountsResult[0].count;
  //SEND TO CONTROLLER
  return {
    data: discounts,
    total: totalDiscounts,
  };
};

//UPDATE
const updateDiscount = async (payload: any) => {
  const { id, code, discountType, discountAmount, minimumSpend } = payload;
  const [result] = (await pool.query(
    'UPDATE discount SET code = ?, discountType = ?, discountAmount = ?, minimumSpend = ? WHERE id = ?',
    [
      code,
      discountType,
      parseFloat(discountAmount),
      parseFloat(minimumSpend),
      id,
    ],
  )) as any[];

  return result;
};

//DELETE
const deleteDiscount = async (id: any) => {
  const result = await pool.query('DELETE FROM discount WHERE id = ?', [
    Number(id),
  ]);
  return result;
};

//
export const DiscountServices = {
  createDiscount,
  updateDiscount,
  getAllDiscounts,
  deleteDiscount,
};
