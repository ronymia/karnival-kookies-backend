import express from 'express';
import { MessageControllers } from './message.controller';
import verifyToken from '../../middlewares/verifyToken';
import verifyAdmin from '../../middlewares/verifyAdmin';

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
router.post('/', MessageControllers.createMessage);

//  GET ALL
router.get('/', verifyToken, verifyAdmin, MessageControllers.getAllMessages);

// DELETE
router.delete(
  '/:id',
  verifyToken,
  verifyAdmin,
  MessageControllers.deleteMessage,
);

export const MessageRoutes = router;
