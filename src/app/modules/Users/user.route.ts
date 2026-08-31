import express from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

// CREATE USER
router.post(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  UserControllers.createUser,
);

//  GET ALL USERS
router.get(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  UserControllers.getAllUsers,
);

// UPDATE USER
router.patch(
  '/:id',
  auth('admin', 'superAdmin', 'super_admin'),
  UserControllers.updateUser,
);

export const UserRoutes = router;
