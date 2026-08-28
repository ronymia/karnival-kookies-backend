import express from 'express';
import { PackageControllers } from './package.controller';
import dynamicFileUpload from '../../middlewares/uploadFiles';
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

//  CREATE PACKAGE
router.post(
  '/',
  auth('admin', 'superAdmin'),
  // validateRequest(PackageValidations.createSchema),
  PackageControllers.createPackage,
);

//  GET ALL PACKAGES
router.get('/', PackageControllers.getAllPackages);

// GET PACKAGE BY ID
router.get('/:id', PackageControllers.getPackageById);

// UPDATE PACKAGE
router.patch(
  '/',
  auth('admin', 'superAdmin'),
  // validateRequest(PackageValidations.updateSchema),
  PackageControllers.updatePackage,
);

// DELETE PACKAGE
router.delete(
  '/:ids',
  auth('admin', 'superAdmin'),
  PackageControllers.deletePackage,
);

// UPLOAD PACKAGE FILES
router.post(
  '/upload-bulk-images',
  auth('admin', 'superAdmin'),
  dynamicFileUpload('files', 'public/packages'),
  PackageControllers.uploadPackageFiles,
);

export const PackageRoutes = router;
