import express from 'express';
import { AuthControllers } from './auth.controller';
import { AuthValidations } from './auth.validation';
import validateRequest from '../../middlewares/validateRequest';

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

//  REGISTER
router.post(
  '/register',
  validateRequest(AuthValidations.registerZodSchema),
  AuthControllers.RegisterUser,
);

// LOGIN
router.post(
  '/login',
  validateRequest(AuthValidations.loginZodSchema),
  AuthControllers.loginUser,
);

// REFRESH TOKEN
router.post(
  '/refresh-token',
  validateRequest(AuthValidations.refreshTokenZodSchema),
  AuthControllers.refreshToken,
);

// RESET PASSWORD
router.put(
  '/user/reset-password/:email',
  validateRequest(AuthValidations.refreshTokenZodSchema),
  AuthControllers.refreshToken,
);

// LOGOUT
router.post('/logOut', AuthControllers.logOut);

// USER EXIST OR NOT CHECK
router.post('/is-user-exist', AuthControllers.sendPasswordCode);

// VERIFY USER MAIL
router.put('/user/verify/:email', AuthControllers.verifyUserMail);

// CURRENT USER
router.put('/user/info', AuthControllers.getCurrentUser);

export const AuthRoutes = router;
