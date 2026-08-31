import express from 'express';
import auth from '../../middlewares/auth';
import { MetaDataControllers } from './metaData.controller';
import validateRequest from '../../middlewares/validateRequest';
import { MetaDataValidations } from './metaData.validation';

const router = express.Router();

//  CREATE META DATA
router.post(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
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
  auth('admin', 'superAdmin', 'super_admin'),
  validateRequest(MetaDataValidations.createSchema),
  MetaDataControllers.updateMetaData,
);

// DELETE META DATA
router.delete(
  '/:ids',
  auth('admin', 'superAdmin', 'super_admin'),
  MetaDataControllers.deleteMetaData,
);

export const MetaDataRoutes = router;
