import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';

// CREATE
const createRating = async (payload: any) => {
  const { productId, email, rating, comment } = payload;

  const [existingReview] = (await pool.query(
    'SELECT id FROM review WHERE productId = ? AND email = ?',
    [parseInt(productId), email],
  )) as any[];

  if (existingReview.length > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      'You have already reviewed this product.',
    );
  }

  // Insert new category
  const [result] = (await pool.query(
    'INSERT INTO review (productId, email, rating, comment) VALUES (?, ?, ?, ?)',
    [parseInt(productId), email, parseInt(rating), comment],
  )) as any[];
  const newReview = {
    id: result.insertId,
    productId: parseInt(productId),
    email,
    rating: parseInt(rating),
    comment,
  };

  //
  return newReview;
};
// GET ALL
const getAllRatings = async (id: any) => {
  const [reviews] = (await pool.query(
    'SELECT * FROM review WHERE productId = ? ORDER BY created_at DESC',
    [parseInt(id)],
  )) as any[];

  const updatedReviews = await Promise.all(
    reviews.map(async (review: any) => {
      const [user] = (await pool.query('SELECT * FROM users where email = ?', [
        review.email,
      ])) as any[];
      return {
        ...review,
        name: user[0]?.name,
        phone: user[0]?.phone,
      };
    }),
  );

  // Fetch total category count
  const [totalReviewsResult] = (await pool.query(
    `
  SELECT
    COUNT(*) as count,
    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as fiveStarCount,
    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as fourStarCount,
    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as threeStarCount,
    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as twoStarCount,
    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as oneStarCount
  FROM
    review
  WHERE
    productId = ?
  `,
    [id],
  )) as any[];

  // console.log(totalReviewsResult);

  return {
    data: updatedReviews,
    stars: {
      stars_5: totalReviewsResult[0].fiveStarCount,
      stars_4: totalReviewsResult[0].fourStarCount,
      stars_3: totalReviewsResult[0].threeStarCount,
      stars_2: totalReviewsResult[0].twoStarCount,
      stars_1: totalReviewsResult[0].oneStarCount,
    },
    total: totalReviewsResult[0].count,
  };
};

// UPDATE
const updateRating = async (payload: any) => {
  const { id, productId, email, rating, comment } = payload;

  const result = await pool.query(
    'UPDATE review SET productId = ?, email = ?, rating = ?, comment = ? WHERE id = ?',
    [productId, email, rating, comment, id],
  );

  return result;
};

// DELETE
const deleteRating = async (id: any) => {};

export const RatingServices = {
  createRating,
  getAllRatings,
  updateRating,
  deleteRating,
};
