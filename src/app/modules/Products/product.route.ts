import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import verifyAdmin from '../../middlewares/verifyAdmin';
import { ProductControllers } from './product.controller';
import multer from 'multer';
import path from 'path';

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
router.post('/', verifyToken, verifyAdmin, ProductControllers.createProduct);

// GET ALL
router.get('/', ProductControllers.getAllClientProducts);

// GET ALL
router.get('/all-products', ProductControllers.getAllProducts);

// GET PRODUCT BY ID
router.get('/:id', ProductControllers.getProductById);

// GET PRODUCT BY CATEGORY
router.get('/category/:id', ProductControllers.getProductByCategoryID);

//   GET RANDOM PRODUCT
router.get('/get/random', ProductControllers.getRandomProduct);

//   GET PRODUCT BY PRICE RANGE
router.get('/price-range', ProductControllers.getProductByPriceRange);

// UPLOAD PRODUCT IMAGES
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Images/Products');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '_' + Date.now() + path.extname(file.originalname),
    );
  },
});

const productUpload = multer({
  storage: productStorage,
}).array('files');
//  UPLOAD PRODUCT IMAGES
router.post(
  '/upload',
  productUpload,
  verifyToken,
  verifyAdmin,
  ProductControllers.uploadProductImage,
);

// UPDATE
router.put('/', verifyToken, verifyAdmin, ProductControllers.updateProduct);

// DELETE
router.delete(
  '/:id',
  verifyToken,
  verifyAdmin,
  ProductControllers.deleteProduct,
);

export const ProductRoutes = router;
