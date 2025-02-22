import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import { OrderControllers } from './order.controller';

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

// ORDER GET ALL ORDERS FOR USER
router.get('/', verifyToken, OrderControllers.getAllOrders);

// ORDER GET BY USER ID
router.get('/:user_id', verifyToken, OrderControllers.getOrderByUserId);

// UPDATE ORDER STATUS
router.put(
  '/change-status/:id',
  verifyToken,
  OrderControllers.orderChangeStatus,
);

export const OrderRoutes = router;
