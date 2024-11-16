import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import verifyAdmin from '../../middlewares/verifyAdmin';
import validateRequest from '../../middlewares/validateRequest';
import { RatingControllers } from './rating.controller';
import { RatingValidations } from './rating.validation';

const router = express.Router();

/***************
 * @api {post} /products
 * @apiDescription create a new product
 * @apiPermission  superAdmin , admin
 *
 * @apiHeader {string} => user's access token
 * @apiHeaderExample {json} Header-Example:
 *
 * @apiQuery {page}   [page=1] => List pages
 * @apiQuery {Number{1-100}}    [Limit=10] per page
 *
 *@apiSuccess {Object[]} Response=> data:product object
 *
 *@apiError {Unauthorized 401} => only authorized users can access this
 *@apiError {forbidden 403} => only only can access this
 *
 *********************/

//  CREATE
router.post(
  '/',
  verifyToken,
  validateRequest(RatingValidations.createSchema),
  RatingControllers.createRating,
);

//  GET ALL
router.get('/:id', RatingControllers.getAllRatings);

//  UPDATE
router.put(
  '/',
  verifyToken,
  //   validateRequest(DiscountValidations.updateSchema),
  RatingControllers.updateRating,
);

// DELETE
router.delete('/:id', verifyToken, RatingControllers.deleteRating);

export const RatingRoutes = router;
