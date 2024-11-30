import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import verifyAdmin from '../../middlewares/verifyAdmin';
import { CartControllers } from './cart.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CartValidations } from './cart.validation';

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

//  CREATE NEW CART
router.post(
  '/',
  verifyToken,
  validateRequest(CartValidations.createSchema),
  CartControllers.createCart,
);

//  GET ALL CART USER SPECIFIC BY EMAIL
router.get('/:email', verifyToken, CartControllers.getCartByEmail);

//  GET ALL CART FOR ADMIN
router.get(
  '/checkout/admin/all',
  verifyToken,
  verifyAdmin,
  CartControllers.getAllCarts,
);

//  UPDATE
router.put(
  '/',
  verifyToken,
  //   validateRequest(CartValidations.createSchema),
  CartControllers.updateCart,
);

// CHECK OUT BY EMAIL
router.get('/checkout/:email', verifyToken, CartControllers.checkOutByEmail);

// CHECK OUT
router.post(
  '/checkout',
  verifyToken,
  validateRequest(CartValidations.checkOutSchema),
  CartControllers.checkOut,
);

// UPDATE CART STATUS
router.post(
  '/checkout/:id',
  verifyToken,
  verifyAdmin,
  CartControllers.updateCartStatus,
);

// DELETE CART CART
router.delete('/:id', verifyToken, verifyAdmin, CartControllers.deleteCart);
// DELETE CART BULK CART
router.delete('/', verifyToken, verifyAdmin, CartControllers.deleteBulkCart);

export const CartRoutes = router;
