import express from 'express';
import { CategoryControllers } from './categories.controller';
import verifyToken from '../../middlewares/verifyToken';
import verifyAdmin from '../../middlewares/verifyAdmin';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidations } from './categories.validation';
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
  auth('admin', 'superAdmin'),
  validateRequest(CategoryValidations.createSchema),
  CategoryControllers.createCategory,
);

//  GET ALL
router.get('/', CategoryControllers.getAllCategories);

//  UPDATE
router.put(
  '/',
  auth('admin', 'superAdmin'),
  validateRequest(CategoryValidations.updateSchema),
  CategoryControllers.updateCategory,
);

// DELETE
router.delete(
  '/:id',
  auth('admin', 'superAdmin'),
  CategoryControllers.deleteCategory,
);

export const CategoryRoutes = router;
