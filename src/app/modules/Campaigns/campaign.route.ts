import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CampaignControllers } from './campaign.controller';
import { CampaignValidations } from './campaign.validation';

const router = express.Router();

// EVALUATE CART PROMOTIONS / COUPONS (Public/Client)
router.post(
  '/evaluate',
  validateRequest(CampaignValidations.evaluateCampaignZodSchema),
  CampaignControllers.evaluateCartCampaigns,
);

// ADMIN: GET ALL CAMPAIGNS
router.get(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  CampaignControllers.getAllCampaigns,
);

// ADMIN: GET CAMPAIGN BY ID
router.get(
  '/:id',
  auth('admin', 'superAdmin', 'super_admin'),
  CampaignControllers.getCampaignById,
);

// ADMIN: CREATE CAMPAIGN
router.post(
  '/',
  auth('admin', 'superAdmin', 'super_admin'),
  validateRequest(CampaignValidations.createCampaignZodSchema),
  CampaignControllers.createCampaign,
);

// ADMIN: UPDATE CAMPAIGN
router.put(
  '/:id',
  auth('admin', 'superAdmin', 'super_admin'),
  validateRequest(CampaignValidations.updateCampaignZodSchema),
  CampaignControllers.updateCampaign,
);

// ADMIN: DELETE CAMPAIGN
router.delete(
  '/:id',
  auth('admin', 'superAdmin', 'super_admin'),
  CampaignControllers.deleteCampaign,
);

export const CampaignRoutes = router;
