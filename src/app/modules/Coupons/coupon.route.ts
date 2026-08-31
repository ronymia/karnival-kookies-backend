import express from 'express';
import auth from '../../middlewares/auth';
import verifyToken from '../../middlewares/verifyToken';
import { CouponControllers } from './coupon.controller';

const router = express.Router();

// CREATE
router.post(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  // validateRequest(CouponValidations.createSchema),
  CouponControllers.createCoupon,
);

// GET ALL
router.get('/', verifyToken, CouponControllers.getAllCoupons);

//  GET SINGLE CODE
router.get('/:id', verifyToken, CouponControllers.getCouponCodeById);

// UPDATE
router.patch(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  // validateRequest(CouponValidations.updateSchema),
  CouponControllers.updateCoupon,
);

// DELETE
router.delete(
  '/:ids',
  auth('admin', 'superAdmin', 'super_admin'),
  CouponControllers.deleteCoupon,
);

export const CouponRoutes = router;
