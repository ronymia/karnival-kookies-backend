import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';
import { RowDataPacket } from 'mysql2';

// GET ALL DASHBOARD DATA
const adminDashboard = async () => {
  // Get total orders
  const [totalOrders] = await pool.query<RowDataPacket[]>(`
    SELECT COUNT(*) AS totalOrders FROM orders
  `);

  // Get orders from the last 7 days using the created_at field
  const [last7DaysOrders] = await pool.query<RowDataPacket[]>(`
    SELECT COUNT(*) AS last7DaysOrders
    FROM orders
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  `);

  // Get orders from the last 30 days using the created_at field
  const [last30DaysOrders] = await pool.query<RowDataPacket[]>(`
    SELECT COUNT(*) AS last30DaysOrders
    FROM orders
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);

  // Get total sales
  const [totalSales] = await pool.query<RowDataPacket[]>(`
    SELECT SUM(pmt.amount) AS totalMoneySpent
    FROM orders o
    LEFT JOIN payments pmt ON o.id = pmt.order_id
  `);

  // Get sales from the last 7 days
  const [last7DaysSales] = await pool.query<RowDataPacket[]>(`
    SELECT SUM(pmt.amount) AS last7DaysSpent
    FROM orders o
    LEFT JOIN payments pmt ON o.id = pmt.order_id
    WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
  `);

  // Get sales from the last 30 days
  const [last30DaysSales] = await pool.query<RowDataPacket[]>(`
    SELECT SUM(pmt.amount) AS last30DaysSpent
    FROM orders o
    LEFT JOIN payments pmt ON o.id = pmt.order_id
    WHERE o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  `);

  // Get total products
  const [totalProducts] = await pool.query<RowDataPacket[]>(`
    SELECT COUNT(*) AS totalProducts FROM products
  `);

  // Get total users
  const [totalUsers] = await pool.query<RowDataPacket[]>(`
    SELECT COUNT(*) AS totalUsers FROM users
  `);

  // Get total items in cart
  const [totalCartItems] = await pool.query<RowDataPacket[]>(`
    SELECT COUNT(*) AS totalCartItems FROM carts
  `);

  // Send the data as response
  return {
    totalOrders: totalOrders[0].totalOrders,
    last7DaysOrders: last7DaysOrders[0].last7DaysOrders,
    last30DaysOrders: last30DaysOrders[0].last30DaysOrders,
    totalSales: totalSales[0].totalMoneySpent,
    last7DaysSales: last7DaysSales[0].last7DaysSpent,
    last30DaysSales: last30DaysSales[0].last30DaysSpent,
    totalProducts: totalProducts[0].totalProducts,
    totalUsers: totalUsers[0].totalUsers,
    totalCartItems: totalCartItems[0].totalCartItems,
  };
};

// GET USER SPECIFIC DASHBOARD DATA
const userDashboard = async (user_id: number) => {
  // GET USER BY USER ID
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE id = ?',
    [user_id],
  );

  const user = rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid user_id');
  }

  // Get total orders for the specific user
  const [totalOrders] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS totalOrders FROM orders WHERE user_id = ?`,
    [user_id],
  );

  // Get orders from the last 7 days for the specific user
  const [last7DaysOrders] = await pool.query<RowDataPacket[]>(
    `
      SELECT COUNT(*) AS last7DaysOrders
      FROM orders
      WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
    [user_id],
  );

  // Get orders from the last 30 days for the specific user
  const [last30DaysOrders] = await pool.query<RowDataPacket[]>(
    `
      SELECT COUNT(*) AS last30DaysOrders
      FROM orders
      WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
    [user_id],
  );

  // Get total money spent by the user
  const [totalMoneySpent] = await pool.query<RowDataPacket[]>(
    `
  SELECT SUM(pmt.amount) AS totalMoneySpent
  FROM orders o
  LEFT JOIN payments pmt ON o.id = pmt.order_id
  WHERE o.user_id = ?
`,
    [user_id],
  );

  // Get money spent in the last 7 days for the user
  const [last7DaysSpent] = await pool.query<RowDataPacket[]>(
    `
  SELECT SUM(pmt.amount) AS last7DaysSpent
  FROM orders o
  LEFT JOIN payments pmt ON o.id = pmt.order_id
  WHERE o.user_id = ?
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
`,
    [user_id],
  );

  // Get money spent in the last 30 days for the user
  const [last30DaysSpent] = await pool.query<RowDataPacket[]>(
    `
  SELECT SUM(pmt.amount) AS last30DaysSpent
  FROM orders o
  LEFT JOIN payments pmt ON o.id = pmt.order_id
  WHERE o.user_id = ?
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
`,
    [user_id],
  );

  // Get total items in the cart for the specific user
  const [totalCartItems] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS totalCartItems FROM carts WHERE user_id = ?`,
    [user_id],
  );

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
