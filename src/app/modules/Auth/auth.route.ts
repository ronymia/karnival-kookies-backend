import express from 'express';
import { AuthControllers } from './auth.controller';
import { AuthValidations } from './auth.validation';
import validateRequest from '../../middlewares/validateRequest';
import verifyToken from '../../middlewares/verifyToken';

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

// LOGOUT
router.post('/logOut', AuthControllers.logOut);

// REFRESH TOKEN
router.post(
  '/refresh-token',
  validateRequest(AuthValidations.refreshTokenZodSchema),
  AuthControllers.refreshToken,
);
// GET ACCESS TOKEN
router.post('/get-access-token', AuthControllers.getAccessToken);

// RESET PASSWORD
router.put('/reset-password', AuthControllers.resetPassword);
router.post('/send-verification-code', AuthControllers.sendPasswordCode); // SEND VERIFICATION CODE
router.post('/verify-email-code', AuthControllers.verifyEmailCode); // VERIFY EMAIL CODE

// VERIFY USER MAIL
router.put('/verify-user-email', AuthControllers.verifyUserMail);

// GET USER BY TOKEN OR MAIL
router.get('/user-by-token', verifyToken, AuthControllers.getUserByToken);
router.get('/user-by-mail/:email', verifyToken, AuthControllers.getUserByMail);

export const AuthRoutes = router;
