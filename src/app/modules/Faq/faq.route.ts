import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import verifyAdmin from '../../middlewares/verifyAdmin';
import validateRequest from '../../middlewares/validateRequest';
import { FaqValidations } from './faq.validation';
import { FaqControllers } from './faq.controller';

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
  validateRequest(FaqValidations.createSchema),
  FaqControllers.createFaq,
);

//  GET ALL
router.get('/', FaqControllers.getAllFaq);

//  UPDATE
router.put(
  '/',
  verifyToken,
  verifyAdmin,
  //   validateRequest(DiscountValidations.updateSchema),
  FaqControllers.updateFaq,
);

// DELETE
router.delete('/:id', verifyToken, verifyAdmin, FaqControllers.deleteFaq);

export const FaqRoutes = router;
