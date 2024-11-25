import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import verifyAdmin from '../../middlewares/verifyAdmin';
import validateRequest from '../../middlewares/validateRequest';
import { DiscountValidations } from './discount.validation';
import { DiscountControllers } from './discount.controller';

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
  verifyAdmin,
  validateRequest(DiscountValidations.createSchema),
  DiscountControllers.createDiscount,
);
// router.post(
//   '/',
//   verifyToken,
//   verifyAdmin,
//   validateRequest(DiscountValidations.createSchema),
//   DiscountControllers.createDiscount,
// );

//  GET ALL
router.get('/', verifyToken, DiscountControllers.getAllDiscounts);

//  UPDATE
router.put(
  '/',
  verifyToken,
  verifyAdmin,
  validateRequest(DiscountValidations.updateSchema),
  DiscountControllers.updateDiscount,
);

// DELETE
router.delete(
  '/:id',
  verifyToken,
  verifyAdmin,
  DiscountControllers.deleteDiscount,
);

export const DiscountRoutes = router;
