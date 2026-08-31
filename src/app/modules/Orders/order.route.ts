import express from 'express';
import auth from '../../middlewares/auth';
import verifyToken from '../../middlewares/verifyToken';
import { OrderControllers } from './order.controller';

const router = express.Router();

// ORDER GET ALL ORDERS FOR ADMIN
router.get(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  OrderControllers.getAllOrders,
);

// ORDER GET BY USER ID
router.get('/:user_id', verifyToken, OrderControllers.getOrderByUserId);

// UPDATE ORDER STATUS (ADMIN ONLY)
router.put(
  '/change-status/:id',
  auth('admin', 'superAdmin', 'super_admin'),
  OrderControllers.orderChangeStatus,
);

export const OrderRoutes = router;
