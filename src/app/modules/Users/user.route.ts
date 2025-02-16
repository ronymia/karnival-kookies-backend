import express from 'express';
import { UserControllers } from './user.controller';
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
// UPDATE USER
router.post('/', auth('superAdmin', 'admin'), UserControllers.createUser);

//  GET ALL USER
router.get('/', auth('superAdmin', 'admin'), UserControllers.getAllUsers);

// UPDATE USER
router.patch('/:id', auth('superAdmin', 'admin'), UserControllers.updateUser);

export const UserRoutes = router;
