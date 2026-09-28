import { Request, RequestHandler, Response } from 'express';
import httpStatus from 'http-status';
import { paginationFields } from '../../../constants/pagination';
import catchAsync from '../../../shared/catchAsync';
import pick from '../../../shared/pick';
import sendResponse from '../../../shared/sendResponse';
import { campaignFilterableFields } from './campaign.constant';
import { CampaignServices } from './campaign.service';

const createCampaign: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CampaignServices.createCampaign(req.body);
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Campaign created successfully',
      data: result,
    });
  },
);

const getAllCampaigns: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, campaignFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);
    const result = await CampaignServices.getAllCampaigns(
      filters,
      paginationOptions,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Campaigns retrieved successfully',
      meta: result.meta,
      data: result.data,
    });
  },
);

const getCampaignById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CampaignServices.getCampaignById(Number(req.params.id));
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Campaign retrieved successfully',
      data: result,
    });
  },
);

const updateCampaign: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CampaignServices.updateCampaign(
      Number(req.params.id),
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Campaign updated successfully',
      data: result,
    });
  },
);

const deleteCampaign: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await CampaignServices.deleteCampaign(Number(req.params.id));
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Campaign deleted successfully',
      data: result,
    });
  },
);

const evaluateCartCampaigns: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    if (!payload.user_id && req.user?.id) {
      payload.user_id = req.user.id;
    }
    const result = await CampaignServices.evaluateCartCampaigns(payload);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Campaign evaluation completed',
      data: result,
    });
  },
);

export const CampaignControllers = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  evaluateCartCampaigns,
};
