import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { EmailHelpers } from '../../../helpers/emailHelpers';

//   CREATE A NEW CART
const createCart = async (payload: any) => {
  const { productId, email, quantity } = payload;

  //
  // Check if cart item already exists
  const [exists] = (await pool.query(
    'SELECT * FROM cart WHERE email = ? AND productId = ?',
    [email, productId],
  )) as any[];
  if (exists.length) {
    return { success: false, quantity, exists: exists[0] };
  }

  // Insert new cart item
  const [result] = await pool.query(
    'INSERT INTO cart (productId, email, quantity, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    [productId, email, quantity, new Date(), new Date()],
  );

  //
  return result;
};

// GET ALL CART USER SPECIFIC BY EMAIL
const getCartByEmail = async (email: string) => {
  const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ])) as any[];

  const user = rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'Invalid Email');
  }
  // Get cart items
  const [cartItems] = (await pool.query('SELECT * FROM cart WHERE email = ?', [
    email,
  ])) as any[];

  // Get total count of cart items
  const [totalItemResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM cart WHERE email = ?',
    [email],
  )) as any[];
  const totalItem = totalItemResult[0].count;

  // Get product details for cart items
  const productIds = cartItems.map((item: any) => item.productId);
  const [products] = (await pool.query(
    'SELECT * FROM product WHERE id IN (?)',
    [productIds],
  )) as any[];

  // Combine cart items with product details
  const carts = cartItems.map((item: any) => {
    const product = products.find((p: any) => p.id === item.productId);
    return {
      ...item,
      product: {
        ...product,
        images: JSON.parse(product?.images),
      },
    };
  });

  return {
    data: carts,
    total: totalItem,
  };
};

// GET ALL CARTS FOR ADMIN
const getAllCarts = async (
  filters: any,
  paginationOptions: TPaginationOptions,
) => {
  const { page = 1, perPage = 20 } = paginationOptions;
  const offset = (Number(page) - 1) * Number(perPage);

  const [checkoutItems] = (await pool.query(
    'SELECT * FROM checkout ORDER BY createdAt DESC LIMIT ? OFFSET ?',
    [perPage, offset],
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
    totalPages: Math.ceil(totalItem / perPage),
  };
};

// UPDATE CART
const updateCart = async (payload: any) => {
  const { exists, quantity } = payload;

  const result = await pool.query(
    'UPDATE cart SET quantity = ?, updatedAt = ? WHERE id = ?',
    [quantity, new Date(), exists.id],
  );

  return { result };
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
    'INSERT INTO checkout (userEmail, checkoutInfo, paymentInfo, paymentMethod, totalPayableAmount,orderId,status, isPaid, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      userEmail,
      JSON.stringify(checkoutInfo),
      JSON.stringify(paymentInfo),
      paymentMethod,
      totalPayableAmount.toFixed(2),
      orderId,
      status,
      isPaid,
      new Date(),
      new Date(),
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
const deleteCart = async (id: any) => {
  const [result] = (await pool.query('DELETE FROM cart WHERE id = ?', [
    Number(id),
  ])) as any[];
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
    `DELETE FROM cart WHERE id IN (${placeholders})`,
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
