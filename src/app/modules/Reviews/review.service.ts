import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { IReviewFilters } from './review.interface';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';

const createReview = async (payload: any) => {
  // DESTRUCTURE PAYLOAD
  const { product_id, user_id, rating, comment } = payload;

  // CHECK IF REVIEW ALREADY EXISTS
  const [existingReview] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
    [product_id, user_id],
  );

  if (existingReview.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      'You have already reviewed this product.',
    );
  }

  // CHECK IF USER HAS PURCHASED THE PRODUCT
  const [order] = await pool.query<RowDataPacket[]>(
    `SELECT oi.id 
     FROM order_items oi
     JOIN orders o ON oi.order_id = o.id
     WHERE oi.product_id = ? AND o.user_id = ? AND o.status = 'delivered'`,
    [product_id, user_id],
  );

  const is_verified = order.length > 0; // If an order exists, verify review

  // INSERT NEW REVIEW
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO reviews (product_id, user_id, rating, comment, is_verified) VALUES (?, ?, ?, ?, ?)',
    [product_id, user_id, parseInt(rating), comment, is_verified],
  );

  // GET THE NEWLY CREATED REVIEW DETAILS
  const [review] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM reviews WHERE id = ?',
    [result.insertId],
  );

  return review[0]; // Return the full review object
};

// GET ALL
const getAllReviews = async (
  filters: IReviewFilters,
  paginationOptions: TPaginationOptions,
) => {
  const { page, limit, offset, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // BUILD THE QUERY
  let query = `
             SELECT 
                  r.*, 
                  JSON_OBJECT(
                      'id', u.id,
                      'name', u.name,
                      'email', u.email
                  ) AS user
              FROM reviews r
              LEFT JOIN users u ON r.user_id = u.id
                `;

  // GENERATE WHERE QUERY
  let whereQuery = '';
  if (Object.keys(filters).length > 0) {
    whereQuery = Object.keys(filters)
      .map((key) => `${key} = ?`)
      .join(' AND ');
  }

  if (whereQuery) {
    query += ` WHERE ${whereQuery}`;
  }

  // SORT QUERY
  if (sortBy && sortOrder) {
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
  }

  // LIMIT QUERY
  if (limit && page) {
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  // EXECUTE THE QUERY
  const [result] = await pool.query<RowDataPacket[]>(query, [
    ...Object.values(filters),
  ]);

  // Get the total count of meta_data entries
  const [totalResult] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM reviews',
  );

  return {
    meta: {
      current_page: page,
      limit,
      total_pages: Math.ceil(totalResult[0]?.count / limit! || 0) || null,
      total: totalResult[0]?.count,
    },
    data: result,
  };
};

// GET REVIEW BY ID
const getReviewById = async (id: number) => {
  // BUILD QUERY
  const query = `SELECT * FROM reviews WHERE id = ?`;

  // EXECUTE QUERY
  const [result] = await pool.query(query, id);

  return result;
};

// UPDATE REVIEW
const updateReview = async (payload: any) => {
  const { id, product_id, user_id, rating, comment } = payload;

  // CHECK IF REVIEW EXISTS AND BELONGS TO THE USER
  const [existingReview] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM reviews WHERE id = ? AND user_id = ?',
    [id, user_id],
  );

  // IF REVIEW NOT FOUND
  if (existingReview.length === 0) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Review not found or you do not have permission to update it.',
    );
  }

  // UPDATE REVIEW
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND user_id = ? AND product_id = ?',
    [parseInt(rating), comment, id, user_id, product_id],
  );

  // IF FAIL TO UPDATE THE REVIEW
  if (result.affectedRows === 0) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to update review.',
    );
  }

  // RETURN UPDATED REVIEW
  const [updatedReview] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM reviews WHERE id = ?',
    [id],
  );

  return updatedReview[0];
};

// DELETE
const deleteReview = async (ids: number[]) => {
  // GENERATE PLACEHOLDER FOR QUERY
  const placeholders = ids.map(() => '?');

  // DELETE QUERY
  const query = `DELETE FROM reviews WHERE id IN (${placeholders})`;

  // EXECUTE QUERY
  const [result] = await pool.query(query, ids);

  return result;
};

export const RatingServices = {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
};
