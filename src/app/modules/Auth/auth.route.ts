import express from 'express';
import { AuthControllers } from './auth.controller';
import { AuthValidations } from './auth.validation';
import validateRequest from '../../middlewares/validateRequest';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import verifyToken from '../../middlewares/verifyToken';

const router = express.Router();

router.post('/jwt', async (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, config.jwt.refresh_token as Secret, {
    expiresIn: config.jwt.refresh_token_expires_in,
  });
  res
    .cookie('refresh_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ success: true });
});

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
router.put('/user/reset-password/:email', AuthControllers.resetPassword);

// LOGOUT
router.post('/logOut', AuthControllers.logOut);

// USER EXIST OR NOT CHECK
router.post('/is-user-exist', AuthControllers.sendPasswordCode);

// VERIFY USER MAIL
router.put('/verify-user-email', AuthControllers.verifyUserMail);

// CURRENT USER
router.get('/user/info', AuthControllers.getCurrentUser);
router.get('/user-by-token', verifyToken, AuthControllers.getUserByToken);

export const AuthRoutes = router;
