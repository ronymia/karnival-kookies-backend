import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import verifyAdmin from '../../middlewares/verifyAdmin';
import { PackageControllers } from './package.controller';

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

//  CREATE PACKAGE
router.post('/', PackageControllers.createPackage);

//  GET ALL PACKAGES
router.get('/', verifyToken, PackageControllers.getAllPackages);

// GET PACKAGE BY ID
router.get('/:id', verifyToken, PackageControllers.getPackageById);

// UPDATE PACKAGE
router.patch('/', verifyToken, verifyAdmin, PackageControllers.updatePackage);

// DELETE PACKAGE
router.delete(
  '/:ids',
  verifyToken,
  verifyAdmin,
  PackageControllers.deletePackage,
);

export const PackageRoutes = router;
