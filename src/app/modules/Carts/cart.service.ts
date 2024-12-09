import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { EmailHelpers } from '../../../helpers/emailHelpers';

//   CREATE A NEW CART
const createCart = async (payload: any): Promise<any> => {
  const { product_id, email, quantity } = payload;

  // Check if cart item already exists
  const [exists] = (await pool.query(
    'SELECT * FROM carts WHERE email = ? AND product_id = ?',
    [email, product_id],
  )) as any[];

  //
  if (exists?.length) {
    throw new AppError(httpStatus.CONFLICT, 'Already in cart list');
  }

  // Insert new cart item
  const [result] = await pool.query(
    'INSERT INTO carts (product_id, email, quantity) VALUES (?, ?, ?)',
    [product_id, email, quantity],
  );

  //
  return result;
};

// GET ALL CART USER SPECIFIC BY EMAIL
const getCartByEmail = async (email: string) => {
  // Query to get cart items with user and product details
  const cartQuery = `
    SELECT 
      c.*,
      JSON_OBJECT(
        'id', u.id,
        'name', u.name,
        'email', u.email
      ) AS user,
      JSON_OBJECT(
        'id', p.id,
        'name', p.name,
        'regular_price', p.regular_price,
        'discount_price', p.discount_price,
        'category_id', p.category_id,
        'images', p.images
      ) AS product
    FROM carts c
    LEFT JOIN users u ON c.email = u.email
    LEFT JOIN products p ON c.product_id = p.id
    WHERE c.email = ?;
  `;

  // Execute the query
  const [cartItems] = (await pool.query(cartQuery, [email])) as any[];

  // Query to get total count of cart items
  const totalItemQuery = `
    SELECT COUNT(*) as count
    FROM carts
    WHERE email = ?;
  `;

  const [totalItemResult] = (await pool.query(totalItemQuery, [
    email,
  ])) as any[];
  const totalItem = totalItemResult[0].count;

  return {
    meta: {
      total: totalItem,
    },
    data: cartItems,
  };
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

// UPDATE CART
const updateCart = async (payload: any): Promise<any> => {
  const { exists, quantity } = payload;

  const result = await pool.query(
    'UPDATE carts SET quantity = ?, WHERE id = ?',
    [quantity, exists.id],
  );

  return result;
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
const checkOut = async (payload: any) => {
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
const deleteCart = async (id: number) => {
  const [result] = await pool.query('DELETE FROM carts WHERE id = ?', [id]);

  return result;
};
// DELETE BULK CART
const deleteBulkCart = async (payload: any) => {
  if (!Array.isArray(payload) || payload.length === 0) {
    return { message: 'No IDs provided' };
  }
  const placeholders = payload.map(() => '?').join(',');

  // Execute the DELETE query for all the provided payload
  const [result] = await pool.query(
    `DELETE FROM carts WHERE id IN (${placeholders})`,
    payload,
  );
  return result;
};
//
export const CartServices = {
  createCart,
  getCartByEmail,
  getAllCarts,
  updateCart,
  checkOutByEmail,
  checkOut,
  updateCartStatus,
  deleteCart,
  deleteBulkCart,
};
