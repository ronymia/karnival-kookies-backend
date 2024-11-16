import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import { PaymentControllers } from './payment.controller';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidations } from './payment.validation';

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

//  STIPE CONFIG
router.get(
  '/payment/config',
  verifyToken,
  //   validateRequest(CartValidations.createSchema),
  PaymentControllers.stripeConfig,
);
//  CREATE NEW CART
router.post(
  '/payment/create-payment-intent',
  verifyToken,
  validateRequest(PaymentValidations.createSchema),
  PaymentControllers.paymentIntent,
);

export const PaymentRoutes = router;
