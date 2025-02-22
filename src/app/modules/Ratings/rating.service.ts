import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// CREATE
const createRating = async (payload: any) => {
  // DESTRUCTURE
  const { product_id, user_id, rating, comment } = payload;

  // CHECK IF REVIEW EXISTS
  const [existingReview] = await pool.query<RowDataPacket[]>(
    'SELECT id FROM reviews WHERE product_id = ? AND user_id = ?',
    [product_id, user_id],
  );
  // IF REVIEW EXISTS
  if (existingReview.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      'You have already reviewed this product.',
    );
  }

  // Insert new category
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [product_id, user_id, parseInt(rating), comment],
  );

  // SEND TO CONTROLLER
  return {
    id: result.insertId,
    product_id,
    user_id,
    rating,
    comment,
  };
};

// GET ALL
const getAllRatings = async (id: any) => {
  //
  const [reviews] = await pool.quer<RowDataPacket[]>(
    'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
    [parseInt(id)],
  );

  const updatedReviews = await Promise.all(
    reviews.map(async (review: any) => {
      const [user] = await pool.query<RowDataPacket[]>(
        'SELECT * FROM users where id = ?',
        [review.id],
      );
      return {
        ...review,
        name: user[0]?.name,
        phone: user[0]?.phone,
      };
    }),
  );

  // Fetch total category count
  const [totalReviewsResult] = await pool.query<RowDataPacket[]>(
    `
  SELECT
    COUNT(*) as count,
    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStarCount,
    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStarCount,
    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStarCount,
    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStarCount,
    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStarCount
  FROM
    reviews
  WHERE
    product_id = ?
  `,
    [id],
  );

  // console.log(totalReviewsResult);

  return {
    meta: {
      current_page: 1,
      limit: 10,
      total_pages: Math.ceil(totalReviewsResult[0].count / 10),
      total: totalReviewsResult[0].count,
    },
    data: {
      updatedReviews,
      stars: {
        stars_5: totalReviewsResult[0].fiveStarCount,
        stars_4: totalReviewsResult[0].fourStarCount,
        stars_3: totalReviewsResult[0].threeStarCount,
        stars_2: totalReviewsResult[0].twoStarCount,
        stars_1: totalReviewsResult[0].oneStarCount,
      },
    },
  };
};

// UPDATE
const updateRating = async (payload: any) => {
  const { id, product_id, user_id, rating, comment } = payload;

  const result = await pool.query(
    'UPDATE reviews SET product_id = ?, user_id = ?, rating = ?, comment = ? WHERE id = ?',
    [product_id, user_id, rating, comment, id],
  );

  return result;
};

// DELETE
const deleteRating = async (ids: number[]) => {
  // GENERATE PLACEHOLDER FOR QUERY
  const placeholders = ids.map(() => '?');

  // DELETE QUERY
  const query = `DELETE FROM reviews WHERE id IN (${placeholders})`;

  // EXECUTE QUERY
  const [result] = await pool.query(query, ids);

  return result;
};

export const RatingServices = {
  createRating,
  getAllRatings,
  updateRating,
  deleteRating,
};
