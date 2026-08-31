import express from 'express';
import auth from '../../middlewares/auth';
import verifyToken from '../../middlewares/verifyToken';
import { DashboardControllers } from './dashboard.controller';

const router = express.Router();

//  GET ADMIN ROUTE
router.get(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  DashboardControllers.adminDashboard,
);

// USER
router.get('/user/:email', verifyToken, DashboardControllers.userDashboard);
router.get('/:user_id', verifyToken, DashboardControllers.userDashboard);

export const DashboardRoutes = router;
