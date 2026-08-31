import express from 'express';
import auth from '../../middlewares/auth';
import verifyToken from '../../middlewares/verifyToken';
import { RatingControllers } from './review.controller';

const router = express.Router();

//  CREATE
router.post(
  '/',
  verifyToken,
  // validateRequest(RatingValidations.createSchema),
  RatingControllers.createReview,
);

//  GET ALL
router.get('/', RatingControllers.getAllReviews);

//  GET BY ID
router.get('/:id', RatingControllers.getReviewById);

//  UPDATE
router.patch(
  '/',
  verifyToken,
  //   validateRequest(DiscountValidations.updateSchema),
  RatingControllers.updateReview,
);

// DELETE
router.delete(
  '/:ids',
  auth('admin', 'superAdmin', 'super_admin'),
  RatingControllers.deleteReview,
);

export const ReviewRoutes = router;
