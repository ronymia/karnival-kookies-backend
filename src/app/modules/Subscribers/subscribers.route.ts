import express from 'express';
import { SubscribersControllers } from './subscribers.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SubscribersValidations } from './subscribers.validation';
import auth from '../../middlewares/auth';

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
  validateRequest(SubscribersValidations.createSchema),
  SubscribersControllers.createSubscribers,
);

//  GET ALL
router.get(
  '/',
  auth('admin', 'superAdmin'),
  SubscribersControllers.getAllSubscribers,
);

export const SubscribersRoutes = router;
