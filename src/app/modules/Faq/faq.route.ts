import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FaqValidations } from './faq.validation';
import { FaqControllers } from './faq.controller';

const router = express.Router();

//  CREATE
router.post(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  validateRequest(FaqValidations.createSchema),
  FaqControllers.createFaq,
);

//  GET ALL
router.get('/', FaqControllers.getAllFaq);

//  UPDATE
router.put(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  validateRequest(FaqValidations.updateSchema),
  FaqControllers.updateFaq,
);

// DELETE
router.delete(
  '/:id',
  auth('admin', 'superAdmin', 'super_admin'),
  FaqControllers.deleteFaq,
);

export const FaqRoutes = router;
