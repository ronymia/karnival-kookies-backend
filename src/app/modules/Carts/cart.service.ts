import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { EmailHelpers } from '../../../helpers/emailHelpers';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

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

// GET ALL CARTS FOR ADMIN
const getAllCarts = async (
  filters: any,
  paginationOptions: TPaginationOptions,
) => {
  const { page, limit, offset } =
    paginationHelpers.calculatePagination(paginationOptions);

  const [checkoutItems] = (await pool.query(
    'SELECT * FROM checkout ORDER BY createdAt DESC LIMIT ? OFFSET ?',
    [limit, offset],
  )) as any[];

  const parsedCheckouts = checkoutItems.map((checkout: any) => {
    const parsedCheckoutInfo = JSON.parse(checkout.checkoutInfo);
    const parsedPaymentInfo = JSON.parse(checkout.paymentInfo);
    return {
      ...checkout,
      checkoutInfo: parsedCheckoutInfo,
      paymentInfo: parsedPaymentInfo,
    };
  });

  const productIds = parsedCheckouts
    .map((item: any) => item?.paymentInfo)
    ?.flat()
    ?.map((item: any) => item?.productId);

  //
  const [products] = (await pool.query(
    'SELECT * FROM product WHERE id IN (?)',
    [productIds],
  )) as any[];

  const finalCheckouts = parsedCheckouts.map((item: any) => {
    const paymentInfoWithId = item?.paymentInfo?.map((payment: any) => {
      const product = products?.find(
        (product: any) => product?.id === payment?.productId,
      );
      //  console.log({ product });
      return {
        ...payment,
        product: { ...product, images: JSON.parse(product?.images) },
      };
    });
    //  console.log({ payIn: paymentInfoWithId });
    return {
      ...item,
      paymentInfo: paymentInfoWithId,
    };
  });

  // Get total count of checkout items
  const [totalItemResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM checkout',
  )) as any[];
  const totalItem = totalItemResult[0].count;

  return {
    data: finalCheckouts,
    total: totalItem,
    currentPage: page,
    totalPages: Math.ceil(totalItem / limit!),
  };
};

// CHECKOUT BY EMAIL
const checkOutByEmail = async (
  filters: any,
  paginationOptions: TPaginationOptions,
  email: string,
) => {
  const { page = 1, perPage = 10 } = paginationOptions;

  const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ])) as any[];

  const user = rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid Email');
  }

  //
  const offset = (Number(page) - 1) * Number(perPage);

  // Get paginated and ordered checkout items
  const [checkoutItems] = (await pool.query(
    'SELECT * FROM checkout WHERE userEmail = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
    [email, Number(perPage), offset],
  )) as any[];

  const parsedCheckouts = checkoutItems.map((checkout: any) => {
    const parsedCheckoutInfo = JSON.parse(checkout.checkoutInfo);
    const parsedPaymentInfo = JSON.parse(checkout.paymentInfo);
    return {
      ...checkout,
      checkoutInfo: parsedCheckoutInfo,
      paymentInfo: parsedPaymentInfo,
    };
  });

  const productIds = parsedCheckouts
    .map((item: any) => item?.paymentInfo)
    ?.flat()
    ?.map((item: any) => item?.productId);
  const [products] = (await pool.query(
    'SELECT * FROM product WHERE id IN (?)',
    [productIds],
  )) as any[];

  const finalCheckouts = parsedCheckouts.map((item: any) => {
    const paymentInfoWithId = item?.paymentInfo?.map((payment: any) => {
      const product = products?.find(
        (product: any) => product?.id === payment?.productId,
      );
      console.log({ product });
      return {
        ...payment,
        product: { ...product, images: JSON.parse(product?.images) },
      };
    });
    console.log({ payIn: paymentInfoWithId });
    return {
      ...item,
      paymentInfo: paymentInfoWithId,
    };
  });

  // Get total count of checkout items
  const [totalItemResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM checkout WHERE userEmail = ?',
    [email],
  )) as any[];
  const totalItem = totalItemResult[0].count;

  return {
    data: finalCheckouts,
    total: totalItem,
    currentPage: page,
    totalPages: Math.ceil(totalItem / perPage),
  };
};

// CHECK OUT
const cartCheckOut = async (payload: any) => {
  const {
    userName,
    userEmail,
    checkoutInfo,
    paymentInfo,
    paymentMethod,
    totalPayableAmount,
    status,
    isPaid,
  } = payload;

  //
  const orderId = crypto.randomUUID();

  // Insert checkout
  const [result] = await pool.query(
    'INSERT INTO checkout (userEmail, checkoutInfo, paymentInfo, paymentMethod, totalPayableAmount,orderId,status, isPaid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [
      userEmail,
      JSON.stringify(checkoutInfo),
      JSON.stringify(paymentInfo),
      paymentMethod,
      totalPayableAmount.toFixed(2),
      orderId,
      status,
      isPaid,
    ],
  );
  // console.log({ result });
  // SEND ORDER CONFORMATION MALI
  await EmailHelpers.orderConfirmationMail(userName, userEmail, orderId);
  // Insert checkout info and payment info (assuming they're separate tables)
  // await pool.query("INSERT INTO checkout_info SET ?", checkoutInfo);
  // await pool.query("INSERT INTO payment_info SET ?", paymentInfo);

  return { success: true, data: result };
};

// UPDATE CART STATUS
const updateCartStatus = async (id: any, payload: any) => {
  const { status } = payload;
  const result = await pool.query(
    'UPDATE checkout SET status = ? WHERE id = ?',
    [status, id],
  );

  return { success: true, data: result };
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
  getAllCarts,
  checkOutByEmail,
  cartCheckOut,
  updateCartStatus,
  removeFromCart,
};
