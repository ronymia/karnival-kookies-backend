import express from 'express';
import verifyToken from '../../middlewares/verifyToken';
import { MetaDataControllers } from './metaData.controller';
import validateRequest from '../../middlewares/validateRequest';
import { MetaDataValidations } from './metaData.validation';

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

//  CREATE META DATA
router.post(
  '/',
  verifyToken,
  validateRequest(MetaDataValidations.createSchema),
  MetaDataControllers.createMetaData,
);

//  GET ALL META DATA
router.get('/', MetaDataControllers.getAllMetaData);

// GET META DATA BY ID
router.get('/:id', MetaDataControllers.getMetaDataById);

// UPDATE META DATA
router.patch(
  '/',
  verifyToken,
  validateRequest(MetaDataValidations.createSchema),
  MetaDataControllers.updateMetaData,
);

// DELETE META DATA
router.delete('/:ids', verifyToken, MetaDataControllers.deleteMetaData);

export const MetaDataRoutes = router;
