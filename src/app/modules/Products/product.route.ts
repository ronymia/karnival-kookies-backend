import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import verifyAdmin from '../../middlewares/verifyAdmin';
import { ProductControllers } from './product.controller';
import dynamicFileUpload from '../../middlewares/uploadFiles';
import validateRequest from '../../middlewares/validateRequest';
import { ProductValidations } from './product.validation';

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
  // validateRequest(ProductValidations.createSchema),
  ProductControllers.createProduct,
);

// GET ALL
router.get('/', ProductControllers.getAllClientProducts);

// GET ALL
router.get('/all-products', ProductControllers.getAllProducts);

// GET PRODUCT BY ID
router.get('/:id', ProductControllers.getProductById);

//   GET RANDOM PRODUCT
router.get('/get/random', ProductControllers.getRandomProduct);

// UPLOAD PRODUCT IMAGES

// UPDATE
router.put(
  '/',
  verifyToken,
  verifyAdmin,
  // validateRequest(ProductValidations.updateSchema),
  ProductControllers.updateProduct,
);

// DELETE
router.delete(
  '/:id',
  verifyToken,
  verifyAdmin,
  ProductControllers.deleteProduct,
);

// UPLOAD PRODUCT FILES
router.post(
  '/upload-bulk-files',
  // verifyToken,
  // verifyAdmin,
  dynamicFileUpload('files', 'Images/products'),
  ProductControllers.uploadProductImage,
);

export const ProductRoutes = router;
