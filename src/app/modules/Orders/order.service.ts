import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';
import { IOrder, TOrderFilterableFields } from './order.interface';
import { GenerateTrackingAndOrderId } from './order.utils';

// ORDER CHECK IN
const orderCheckIn = async (payload: IOrder): Promise<any> => {
  const order_id = GenerateTrackingAndOrderId.generateOrderId();
  const tracking_number = GenerateTrackingAndOrderId.generateTrackingNumber();

  const {
    user_id,
    shipping_info,
    payment_info,
    order_items,
    payment_method,
    notes,
  } = payload;

  // Start a transaction
  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    // INSERT ORDER
    const [orderResult] = (await connection.query(
      `INSERT INTO orders (user_id, order_id, tracking_number, shipping_info, payment_info, payment_method, notes ) 
      VALUES (?,?,?,?,?,?,?)`,
      [
        user_id,
        order_id,
        tracking_number,
        JSON.stringify(shipping_info),
        JSON.stringify(payment_info),
        payment_method,
        notes,
      ],
    )) as any[];

    // INSERT ORDER PRODUCTS DETAILS
    for (const item of order_items) {
      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
        VALUES (?, ?, ?, ?)`,
        [orderResult.insertId, item.product_id, item.quantity, item.price],
      );
    }

    // COMMIT THE TRANSACTION IF BOTH INSERT
    await connection.commit();

    return {
      order_id: orderResult.insertId,
    };
  } catch (error) {
    // ROLLBACK TRANSACTION IN CASE GOT OF AN ERROR
    await connection.rollback();

    throw new AppError(httpStatus.BAD_REQUEST, 'Failed to place order');
  } finally {
    // Release the connection
    connection.release();
  }
};

// GET ALL ORDERS
const getAllOrders = async (
  filters: Partial<Record<TOrderFilterableFields, any>>,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  const { page, limit, offset } =
    paginationHelpers.calculatePagination(paginationOptions);

  // Base query with aggregation
  let query = `
    SELECT 
      o.*,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) AS order_items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE 1=1
  `;
  const queryParams: any[] = [];

  // Dynamically add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'start_date' && filters.end_date) {
      query += ` AND o.created_at BETWEEN ? AND ?`;
      queryParams.push(filters.start_date, filters.end_date);
    } else if (key !== 'end_date') {
      query += ` AND o.${key} = ?`;
      queryParams.push(value);
    }
  });

  if (limit && page) {
    // Add grouping and pagination
    query += ` GROUP BY o.id LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
  }

  // Execute the query
  const [orders] = (await pool.query(query, queryParams)) as any[];

  // Get total count for pagination metadata
  const [totalCount] = (await pool.query(
    `SELECT COUNT(*) AS count  FROM orders`,
  )) as any[];

  return {
    meta: {
      currentPage: page,
      limit,
      total: totalCount[0]?.count,
    },
    data: orders,
  };
};

// GET USER SPECIF ORDER
const getOrderByUserId = async (
  user_id: number,
  filters: any,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  const {
    page,
    limit,
    offset,
    sortBy = 'created_at',
    sortOrder = 'DESC',
  } = paginationHelpers.calculatePagination(paginationOptions);

  // Base query with aggregation
  let query = `
    SELECT 
      o.*,
      JSON_ARRAYAGG(
        JSON_OBJECT(
          'product_id', oi.product_id,
          'quantity', oi.quantity,
          'price', oi.price
        )
      ) AS order_items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
    WHERE 1=1
  `;
  const queryParams: any[] = [];

  // Apply user_id filter if provided
  if (user_id) {
    query += ` AND o.user_id = ?`;
    queryParams.push(user_id);
  }

  // Add GROUP BY clause for proper aggregation
  query += ` GROUP BY o.id`;

  // Apply sorting
  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  // Add pagination limits
  if (limit && page) {
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
  }

  // Query to count total orders for user
  let totalOrdersQuery = `
    SELECT COUNT(*) AS total_orders
    FROM orders o
    WHERE 1=1
  `;
  const totalOrdersParams: any[] = [];

  if (user_id) {
    totalOrdersQuery += ` AND o.user_id = ?`;
    totalOrdersParams.push(user_id);
  }

  // Execute both queries using Promise.all
  const [[orders], [totalOrders]] = await Promise.all([
    pool.query(query, queryParams),
    pool.query<any[]>(totalOrdersQuery, totalOrdersParams),
  ]);

  // Return result with data and total count
  return {
    meta: {
      page,
      limit,
      total: totalOrders[0]?.total_orders || 0,
      totalPages: Math.ceil((totalOrders[0]?.total_orders || 0) / limit!),
    },
    data: orders, // Paginated orders with items
  };
};

// const getAllOrders = async (
//   filters: TOrderFilterableFields[],
//   paginationOptions: TPaginationOptions,
// ): Promise<any> => {
//   const { page, limit, offset } =
//     paginationHelpers.calculatePagination(paginationOptions);

//   let query = `
//     SELECT o.*, oi.product_id, oi.quantity, oi.price
//     FROM orders o
//     LEFT JOIN order_items oi ON o.order_id = oi.order_id
//     WHERE 1=1
//   `;
//   const queryParams: any[] = [];

//   // Add filters to query
//   if (filters.status) {
//     query += ' AND o.status = ?';
//     queryParams.push(filters.status);
//   }

//   if (filters.user_id) {
//     query += ' AND o.user_id = ?';
//     queryParams.push(filters.user_id);
//   }

//   if (filters.startDate && filters.endDate) {
//     query += ' AND o.created_at BETWEEN ? AND ?';
//     queryParams.push(filters.startDate, filters.endDate);
//   }

//   // Apply pagination
//   query += ' LIMIT ? OFFSET ?';
//   queryParams.push(limit, offset);

//   try {
//     // Fetch orders with order items
//     const [orders] = (await pool.query(query, queryParams)) as any;

//     // Get total count for pagination
//     const [[{ totalCount }]] = await pool.query(
//       'SELECT COUNT(*) AS totalCount FROM orders o WHERE 1=1',
//     );

//     // Group order items by order_id and attach them to each order
//     const ordersWithItems = orders.reduce((acc: any[], order: any) => {
//       const { order_id, product_id, quantity, price, ...orderDetails } = order;

//       // Find the existing order or create a new one in the accumulator
//       let existingOrder = acc.find((item) => item.order_id === order_id);
//       if (!existingOrder) {
//         existingOrder = { ...orderDetails, order_items: [] };
//         acc.push(existingOrder);
//       }

//       // Add the current item to the order's items array
//       if (product_id) {
//         existingOrder.order_items.push({
//           product_id,
//           quantity,
//           price,
//         });
//       }

//       return acc;
//     }, []);

//     // Return orders with order items and pagination data
//     return {
//       orders: ordersWithItems,
//       pagination: {
//         totalCount,
//         totalPages: Math.ceil(totalCount / limit),
//         currentPage: page,
//         pageSize: limit,
//       },
//     };
//   } catch (error) {
//     console.error('Error fetching orders:', error);
//     throw new Error('Failed to fetch orders');
//   }
// };

// ORDER STATUS CHANGE
const orderCheckOut = async () => {};
const orderChangeStatus = async (id: number, payload: { status: string }) => {
  const { status } = payload;
  const result = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [
    status,
    id,
  ]);

  return result;
};
const orderDelete = async () => {};

export const OrderServices = {
  orderCheckIn,
  orderCheckOut,
  orderChangeStatus,
  orderDelete,
  getAllOrders,
  getOrderByUserId,
};
