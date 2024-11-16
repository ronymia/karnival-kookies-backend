import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';

// GET ALL DASHBOARD DATA
const adminDashboard = async () => {
  // Get total orders
  const [totalOrders] = (await pool.query(
    `SELECT COUNT(*) AS totalOrders FROM checkout`,
  )) as any[];

  // Get orders from the last 7 days using the createdAt field
  const [last7DaysOrders] = (await pool.query(`
        SELECT COUNT(*) AS last7DaysOrders
        FROM checkout
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      `)) as any[];

  // Get orders from the last 30 days using the createdAt field
  const [last30DaysOrders] = (await pool.query(`
        SELECT COUNT(*) AS last30DaysOrders
        FROM checkout
        WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `)) as any[];

  // Get total sales
  const [totalSales] = (await pool.query(
    `SELECT SUM(totalPayableAmount) AS totalSales FROM checkout`,
  )) as any[];

  // Get sales from the last 7 days
  const [last7DaysSales] = (await pool.query(`
            SELECT SUM(totalPayableAmount) AS last7DaysSales
            FROM checkout
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
          `)) as any[];

  // Get sales from the last 30 days
  const [last30DaysSales] = (await pool.query(`
            SELECT SUM(totalPayableAmount) AS last30DaysSales
            FROM checkout
            WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
          `)) as any[];

  // Get total products
  const [totalProducts] = (await pool.query(
    `SELECT COUNT(*) AS totalProducts FROM product`,
  )) as any[];

  // Get total users
  const [totalUsers] = (await pool.query(
    `SELECT COUNT(*) AS totalUsers FROM users`,
  )) as any[];

  // Get total items in cart
  const [totalCartItems] = (await pool.query(
    `SELECT COUNT(*) AS totalCartItems FROM cart`,
  )) as any[];

  // Send the data as response
  return {
    totalOrders: totalOrders[0].totalOrders,
    last7DaysOrders: last7DaysOrders[0].last7DaysOrders,
    last30DaysOrders: last30DaysOrders[0].last30DaysOrders,
    totalSales: totalSales[0].totalSales,
    last7DaysSales: last7DaysSales[0].last7DaysSales,
    last30DaysSales: last30DaysSales[0].last30DaysSales,
    totalProducts: totalProducts[0].totalProducts,
    totalUsers: totalUsers[0].totalUsers,
    totalCartItems: totalCartItems[0].totalCartItems,
  };
};

// GET USER SPECIFIC DASHBOARD DATA
const userDashboard = async (email: string) => {
  const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ])) as any[];

  const user = rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid Email');
  }
  // Get total orders for the specific user
  const [totalOrders] = (await pool.query(
    `SELECT COUNT(*) AS totalOrders FROM checkout WHERE userEmail = ?`,
    [email],
  )) as any[];

  // Get orders from the last 7 days for the specific user
  const [last7DaysOrders] = (await pool.query(
    `
      SELECT COUNT(*) AS last7DaysOrders
      FROM checkout
      WHERE userEmail = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [email],
  )) as any[];

  // Get orders from the last 30 days for the specific user
  const [last30DaysOrders] = (await pool.query(
    `
      SELECT COUNT(*) AS last30DaysOrders
      FROM checkout
      WHERE userEmail = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [email],
  )) as any[];

  // Get total money spent by the user
  const [totalMoneySpent] = (await pool.query(
    `
      SELECT SUM(totalPayableAmount) AS totalMoneySpent
      FROM checkout
      WHERE userEmail = ?`,
    [email],
  )) as any[];

  // Get money spent in the last 7 days for the user
  const [last7DaysSpent] = (await pool.query(
    `
      SELECT SUM(totalPayableAmount) AS last7DaysSpent
      FROM checkout
      WHERE userEmail = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [email],
  )) as any[];

  // Get money spent in the last 30 days for the user
  const [last30DaysSpent] = (await pool.query(
    `
      SELECT SUM(totalPayableAmount) AS last30DaysSpent
      FROM checkout
      WHERE userEmail = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [email],
  )) as any[];

  // Get total items in the cart for the specific user
  const [totalCartItems] = (await pool.query(
    `SELECT COUNT(*) AS totalCartItems FROM cart WHERE email = ?`,
    [email],
  )) as any[];

  // Send the data as a response
  return {
    totalOrders: totalOrders[0].totalOrders,
    last7DaysOrders: last7DaysOrders[0].last7DaysOrders,
    last30DaysOrders: last30DaysOrders[0].last30DaysOrders,
    totalMoneySpent: totalMoneySpent[0].totalMoneySpent,
    last7DaysSpent: last7DaysSpent[0].last7DaysSpent,
    last30DaysSpent: last30DaysSpent[0].last30DaysSpent,
    totalCartItems: totalCartItems[0].totalCartItems,
  };
};

export const DashboardServices = { adminDashboard, userDashboard };
