import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { GenerateTrackingAndOrderId } from '../Orders/order.utils';

//   CREATE A NEW CART
const createCart = async (payload: any): Promise<any> => {
  const { product_id, user_id, quantity } = payload;

  // CHECK CART EXIST WITH PRODUCT AND USER
  const [exists] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM carts WHERE user_id = ? AND product_id = ?',
    [user_id, product_id],
  );

  // IF CART ALREADY EXIST
  if (exists?.length) {
    throw new AppError(httpStatus.CONFLICT, 'Already in cart list');
  }

  // Insert new cart item
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO carts (product_id, user_id, quantity) VALUES (?, ?, ?)',
    [product_id, user_id, quantity],
  );

  //
  return result;
};

// GET ALL CART USER SPECIFIC BY USER ID
const getCartByUserId = async (user_id: number) => {
  // Query to get cart items with user and product details
  const cartQuery = `
    SELECT 
      c.*,
      JSON_OBJECT(
        'id', u.id,
        'email', u.email
      ) AS user,
      JSON_OBJECT(
        'id', p.id,
        'name', p.name,
        'price', p.price,
        'is_discount_enable', p.is_discount_enable,
        'discount_type', p.discount_type,
        'discount_value', p.discount_value,
        'category_id', p.category_id,
        'images', p.images,
        'net_price', 
        CASE
          WHEN p.discount_type = 'fixed' THEN p.price - p.discount_value
          WHEN p.discount_type = 'percent' THEN p.price - (p.price * p.discount_value / 100)
          ELSE p.price
        END
      ) AS product
    FROM carts c
    LEFT JOIN users u ON c.user_id = u.id
    LEFT JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ?;
  `;

  // Execute the query
  const [cartItems] = await pool.query<RowDataPacket[]>(cartQuery, [user_id]);

  // Query to get total count of cart items
  const totalItemQuery = `
    SELECT COUNT(*) as count
    FROM carts
    WHERE user_id = ?;
  `;

  const [totalItemResult] = await pool.query<RowDataPacket[]>(totalItemQuery, [
    user_id,
  ]);
  const totalItem = totalItemResult[0].count;

  return {
    meta: {
      total: totalItem,
    },
    data: cartItems,
  };
};

// UPDATE CART
const updateQuantityOfCartProduct = async (payload: any): Promise<any> => {
  const { exists, quantity } = payload;

  const result = await pool.query(
    'UPDATE carts SET quantity = ? WHERE id = ?',
    [quantity, exists.id],
  );

  return result;
};

// CART CHECKOUT
const cartCheckOut = async (payload: any) => {
  const { user_id, order_items, shipping_info, payment } = payload;
  const order_number = GenerateTrackingAndOrderId.generateOrderId();
  const tracking_number = GenerateTrackingAndOrderId.generateTrackingNumber();

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction(); // Start transaction

    // Insert order
    const [orderResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO orders (user_id,order_number, tracking_number) VALUES (?, ?, ?)`,
      [user_id, order_number, tracking_number],
    );
    const order_id = orderResult.insertId; // Get last inserted order ID

    // Insert order items
    const orderItemsValues = order_items.map((item) => [
      order_id,
      item.product_id,
      item.quantity,
      item.price,
    ]);
    await connection.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?`,
      [orderItemsValues],
    );

    // Insert shipping info
    await connection.execute(
      `INSERT INTO shipping_info
      (order_id, recipient_name, email, apartment, address, city, postal_code, state, country, phone, carrier, delivery_instruction)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order_id,
        shipping_info.recipient_name,
        shipping_info.email,
        shipping_info.apartment,
        shipping_info.address,
        shipping_info.city,
        shipping_info.postal_code,
        shipping_info.state,
        shipping_info.country,
        shipping_info.phone,
        shipping_info.carrier,
        shipping_info.delivery_instruction,
      ],
    );

    // Insert payment
    await connection.execute(
      `INSERT INTO payments (order_id, transaction_id, amount, method, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        order_id,
        payment.transaction_id,
        payment.amount,
        payment.method,
        payment.status,
      ],
    );

    // DELETE ITEMS FROM CART
    await connection.query(`DELETE FROM carts WHERE user_id = ?`, [user_id]);

    // COMMIT TRANSACTION IF ALL QUERIES SUCCEED
    await connection.commit();
    return { order_id };
  } catch (error) {
    // ROLLBACK TRANSACTION IF ENCOUNTERS AN ERROR
    if (connection) await connection.rollback();
    throw error;
  } finally {
    // RELEASE CONNECTION
    if (connection) connection.release();
  }
};

// DELETE CART
const removeFromCart = async (ids: number[]) => {
  // GENERATE PLACEHOLDER FOR QUERY
  const placeholders = ids.map(() => '?');

  // DELETE QUERY
  const query = `DELETE FROM carts WHERE id IN (${placeholders})`;

  // EXECUTE QUERY
  const [result] = await pool.query(query, ids);

  return result;
};
//
export const CartServices = {
  createCart,
  getCartByUserId,
  updateQuantityOfCartProduct,
  cartCheckOut,
  removeFromCart,
};
