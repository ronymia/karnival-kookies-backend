import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';
import { TOrderFilterableFields } from './order.interface';
import { RowDataPacket } from 'mysql2';

// GET ALL ORDERS
const getAllOrders = async (
  filters: Partial<Record<TOrderFilterableFields, any>>,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  // GET PAGINATION AND SORTING INFO
  const { page, limit, offset, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // BASE QUERY
  let query = `
              SELECT 
                  o.*,

                  -- Aggregating order items (Array of objects)
                  IFNULL(
                      JSON_ARRAYAGG(
                          JSON_OBJECT(
                              'product_id', oi.product_id,
                              'quantity', oi.quantity,
                              'price', oi.price,
                              'product', JSON_OBJECT(
                                  'id', p.id,
                                  'name', p.name,
                                  'images', p.images,
                                  'category_id', p.category_id
                              )
                          )
                      ), JSON_ARRAY()
                  ) AS order_items,

                  -- Using MAX() for shipping info (to avoid grouping by all columns)
                  JSON_OBJECT(
                      'recipient_name', MAX(si.recipient_name),
                      'email', MAX(si.email),
                      'apartment', MAX(si.apartment),
                      'address', MAX(si.address),
                      'city', MAX(si.city),
                      'postal_code', MAX(si.postal_code),
                      'state', MAX(si.state),
                      'country', MAX(si.country),
                      'phone', MAX(si.phone),
                      'carrier', MAX(si.carrier),
                      'delivery_instruction', MAX(si.delivery_instruction),
                      'status', MAX(si.status),
                      'estimated_delivery', MAX(si.estimated_delivery)
                  ) AS shipping_info,

                  -- Single Payment Object (Pick the first available payment per order)
                  JSON_OBJECT(
                      'id', MAX(pmt.id), -- Using MAX() to ensure a single row
                      'transaction_id', MAX(pmt.transaction_id),
                      'stripe_payment_intent_id', MAX(pmt.stripe_payment_intent_id),
                      'stripe_payment_method_id', MAX(pmt.stripe_payment_method_id),
                      'amount', MAX(pmt.amount),
                      'method', MAX(pmt.method),
                      'status', MAX(pmt.status)
                  ) AS payment

              FROM orders o
              LEFT JOIN order_items oi ON o.id = oi.order_id
              LEFT JOIN products p ON oi.product_id = p.id
              LEFT JOIN shipping_info si ON o.id = si.order_id
              LEFT JOIN payments pmt ON o.id = pmt.order_id
              WHERE 1=1
`;

  // Construct WHERE conditions for filters
  const queryParams: any[] = [];

  // **Apply Sorting**
  if (sortBy) {
    query += ` ORDER BY o.${sortBy} ${sortOrder}`;
  }

  // Add GROUP BY clause for proper aggregation
  query += ` GROUP BY o.id`;

  // **Apply Pagination**
  if (limit && page) {
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);
  }

  // Execute the query
  const [orders] = await pool.query<RowDataPacket[]>(query, queryParams);

  return {
    meta: {
      currentPage: page,
      limit,
      total: orders.length,
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

                  -- Aggregating order items (Array of objects)
                  IFNULL(
                      JSON_ARRAYAGG(
                          JSON_OBJECT(
                              'product_id', oi.product_id,
                              'quantity', oi.quantity,
                              'price', oi.price,
                              'product', JSON_OBJECT(
                                  'id', p.id,
                                  'name', p.name,
                                  'images', p.images,
                                  'category_id', p.category_id
                              )
                          )
                      ), JSON_ARRAY()
                  ) AS order_items,

                  -- Using MAX() for shipping info (to avoid grouping by all columns)
                  JSON_OBJECT(
                      'recipient_name', MAX(si.recipient_name),
                      'email', MAX(si.email),
                      'apartment', MAX(si.apartment),
                      'address', MAX(si.address),
                      'city', MAX(si.city),
                      'postal_code', MAX(si.postal_code),
                      'state', MAX(si.state),
                      'country', MAX(si.country),
                      'phone', MAX(si.phone),
                      'carrier', MAX(si.carrier),
                      'delivery_instruction', MAX(si.delivery_instruction),
                      'status', MAX(si.status),
                      'estimated_delivery', MAX(si.estimated_delivery)
                  ) AS shipping_info,

                  -- Single Payment Object (Pick the first available payment per order)
                  JSON_OBJECT(
                      'id', MAX(pmt.id), -- Using MAX() to ensure a single row
                      'transaction_id', MAX(pmt.transaction_id),
                      'stripe_payment_intent_id', MAX(pmt.stripe_payment_intent_id),
                      'stripe_payment_method_id', MAX(pmt.stripe_payment_method_id),
                      'amount', MAX(pmt.amount),
                      'method', MAX(pmt.method),
                      'status', MAX(pmt.status)
                  ) AS payment

              FROM orders o
              LEFT JOIN order_items oi ON o.id = oi.order_id
              LEFT JOIN products p ON oi.product_id = p.id
              LEFT JOIN shipping_info si ON o.id = si.order_id
              LEFT JOIN payments pmt ON o.id = pmt.order_id
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
  orderCheckOut,
  orderChangeStatus,
  orderDelete,
  getAllOrders,
  getOrderByUserId,
};
