import httpStatus from 'http-status';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { mysqlcreateConnection as pool } from '../../../config';
import AppError from '../../../errors/AppError';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { campaignSearchableFields } from './campaign.constant';
import {
  ICampaign,
  ICampaignEvaluationPayload,
  ICampaignEvaluationResult,
  IFreeItemReward,
} from './campaign.interface';

// CREATE CAMPAIGN (Admin)
const createCampaign = async (payload: any) => {
  const {
    title,
    description,
    campaign_type,
    trigger_type = 'automatic',
    minimum_spend,
    buy_product_id,
    buy_quantity = 1,
    discount_type,
    discount_value,
    get_product_id,
    get_quantity = 1,
    start_date,
    end_date,
    is_active = true,
    max_uses_total,
    max_uses_per_user = 1,
    coupon_code,
  } = payload;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [campaignResult] = await connection.query<ResultSetHeader>(
      `INSERT INTO campaigns (
        title, description, campaign_type, trigger_type, minimum_spend,
        buy_product_id, buy_quantity, discount_type, discount_value,
        get_product_id, get_quantity, start_date, end_date, is_active,
        max_uses_total, max_uses_per_user
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || null,
        campaign_type,
        trigger_type,
        minimum_spend !== undefined && minimum_spend !== null ? minimum_spend : null,
        buy_product_id || null,
        buy_quantity,
        discount_type || null,
        discount_value !== undefined && discount_value !== null ? discount_value : null,
        get_product_id || null,
        get_quantity,
        start_date || null,
        end_date || null,
        is_active,
        max_uses_total || null,
        max_uses_per_user,
      ],
    );

    const campaignId = campaignResult.insertId;

    // If coupon_code is provided or trigger_type is coupon, create entry in coupons table
    let createdCode = coupon_code;
    if (coupon_code) {
      await connection.query<ResultSetHeader>(
        `INSERT INTO coupons (campaign_id, code, is_active) VALUES (?, ?, ?)`,
        [campaignId, coupon_code.trim().toUpperCase(), is_active],
      );
    }

    await connection.commit();

    return {
      id: campaignId,
      title,
      description,
      campaign_type,
      trigger_type,
      coupon_code: createdCode || null,
      is_active,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// GET ALL CAMPAIGNS (Admin)
const getAllCampaigns = async (
  filters: any,
  paginationOptions: TPaginationOptions,
) => {
  const { page, limit, offset, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const { searchTerm, ...filterData } = filters;
  const conditions: string[] = [];
  const queryParams: any[] = [];

  if (searchTerm) {
    const searchConditions = campaignSearchableFields.map(
      (field) => `c.${field} LIKE ?`,
    );
    conditions.push(`(${searchConditions.join(' OR ')})`);
    campaignSearchableFields.forEach(() => queryParams.push(`%${searchTerm}%`));
  }

  if (Object.keys(filterData).length > 0) {
    Object.entries(filterData).forEach(([key, value]) => {
      conditions.push(`c.${key} = ?`);
      queryParams.push(value);
    });
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  let query = `
    SELECT c.*,
           bp.name as buy_product_name,
           gp.name as get_product_name,
           JSON_ARRAYAGG(
             IF(cp.id IS NOT NULL, JSON_OBJECT('id', cp.id, 'code', cp.code, 'is_active', cp.is_active), NULL)
           ) as coupons
    FROM campaigns c
    LEFT JOIN products bp ON c.buy_product_id = bp.id
    LEFT JOIN products gp ON c.get_product_id = gp.id
    LEFT JOIN coupons cp ON c.id = cp.campaign_id
    ${whereClause}
    GROUP BY c.id
  `;

  if (sortBy && sortOrder) {
    query += ` ORDER BY c.${sortBy} ${sortOrder}`;
  } else {
    query += ` ORDER BY c.created_at DESC`;
  }

  if (limit && page) {
    query += ` LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), offset);
  }

  const [campaigns] = await pool.query<RowDataPacket[]>(query, queryParams);

  // Filter out nulls from JSON_ARRAYAGG
  const formattedData = campaigns.map((item) => ({
    ...item,
    coupons: Array.isArray(item.coupons)
      ? item.coupons.filter(Boolean)
      : [],
  }));

  const [totalResult] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM campaigns c ${whereClause}`,
    queryParams.slice(0, queryParams.length - (limit && page ? 2 : 0)),
  );

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: totalResult[0]?.count || 0,
      total_page: Math.ceil((totalResult[0]?.count || 0) / Number(limit)),
    },
    data: formattedData,
  };
};

// GET CAMPAIGN BY ID (Admin)
const getCampaignById = async (id: number) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.*, 
            bp.name as buy_product_name,
            gp.name as get_product_name,
            JSON_ARRAYAGG(
              IF(cp.id IS NOT NULL, JSON_OBJECT('id', cp.id, 'code', cp.code, 'is_active', cp.is_active), NULL)
            ) as coupons
     FROM campaigns c
     LEFT JOIN products bp ON c.buy_product_id = bp.id
     LEFT JOIN products gp ON c.get_product_id = gp.id
     LEFT JOIN coupons cp ON c.id = cp.campaign_id
     WHERE c.id = ?
     GROUP BY c.id`,
    [id],
  );

  if (rows.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign not found');
  }

  const item = rows[0];
  return {
    ...item,
    coupons: Array.isArray(item.coupons) ? item.coupons.filter(Boolean) : [],
  };
};

// UPDATE CAMPAIGN (Admin)
const updateCampaign = async (id: number, payload: any) => {
  const [existing] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM campaigns WHERE id = ?',
    [id],
  );

  if (existing.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign not found');
  }

  const fields: string[] = [];
  const values: any[] = [];

  const allowedFields = [
    'title',
    'description',
    'campaign_type',
    'trigger_type',
    'minimum_spend',
    'buy_product_id',
    'buy_quantity',
    'discount_type',
    'discount_value',
    'get_product_id',
    'get_quantity',
    'start_date',
    'end_date',
    'is_active',
    'max_uses_total',
    'max_uses_per_user',
  ];

  allowedFields.forEach((key) => {
    if (payload[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(payload[key]);
    }
  });

  if (fields.length > 0) {
    values.push(id);
    await pool.query(`UPDATE campaigns SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  return await getCampaignById(id);
};

// DELETE CAMPAIGN (Admin)
const deleteCampaign = async (id: number) => {
  const [result] = await pool.query<ResultSetHeader>(
    'DELETE FROM campaigns WHERE id = ?',
    [id],
  );

  if (result.affectedRows === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Campaign not found');
  }

  return { message: 'Campaign deleted successfully' };
};

// EVALUATE CART CAMPAIGNS (Client / Checkout)
const evaluateCartCampaigns = async (
  payload: ICampaignEvaluationPayload,
): Promise<ICampaignEvaluationResult> => {
  const { cart_items, coupon_code, user_id } = payload;

  // Calculate net_amount (subtotal without any discount)
  const net_amount = cart_items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0,
  );

  let discount_amount = 0;
  let free_shipping = false;
  const free_items: IFreeItemReward[] = [];
  let applied_campaign: any = null;

  // 1. EVALUATE MANUAL COUPON CODE (IF ENTERED BY USER)
  if (coupon_code && coupon_code.trim() !== '') {
    const formattedCode = coupon_code.trim().toUpperCase();

    const [couponRows] = await pool.query<RowDataPacket[]>(
      `SELECT cp.id as coupon_id, cp.code, cp.is_active as coupon_active,
              c.*
       FROM coupons cp
       JOIN campaigns c ON cp.campaign_id = c.id
       WHERE cp.code = ?`,
      [formattedCode],
    );

    if (couponRows.length === 0 || !couponRows[0].coupon_active) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid or inactive coupon code');
    }

    const camp = couponRows[0];

    // Check if campaign is active
    if (!camp.is_active) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This coupon campaign is currently paused');
    }

    // Check validity dates
    const now = new Date();
    if (camp.start_date && new Date(camp.start_date) > now) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This coupon campaign has not started yet');
    }
    if (camp.end_date && new Date(camp.end_date) < now) {
      throw new AppError(httpStatus.BAD_REQUEST, 'This coupon has expired');
    }

    // Check max uses total
    if (camp.max_uses_total) {
      const [totalUsage] = await pool.query<RowDataPacket[]>(
        `SELECT COUNT(*) as count FROM coupon_usages WHERE campaign_id = ?`,
        [camp.id],
      );
      if ((totalUsage[0]?.count || 0) >= camp.max_uses_total) {
        throw new AppError(httpStatus.BAD_REQUEST, 'This coupon usage limit has been reached');
      }
    }

    // Check max uses per user
    if (user_id && camp.max_uses_per_user) {
      let usageQuery = `SELECT COUNT(*) as count FROM coupon_usages WHERE campaign_id = ? AND user_id = ?`;
      const usageParams: any[] = [camp.id, user_id];

      // If campaign has a start_date, count usages during this campaign cycle
      if (camp.start_date) {
        usageQuery += ` AND used_at >= ?`;
        usageParams.push(camp.start_date);
      }

      const [userUsage] = await pool.query<RowDataPacket[]>(usageQuery, usageParams);
      if ((userUsage[0]?.count || 0) >= camp.max_uses_per_user) {
        throw new AppError(httpStatus.BAD_REQUEST, 'You have already used this coupon');
      }
    }

    // Check minimum spend
    if (camp.minimum_spend && net_amount < Number(camp.minimum_spend)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Minimum spend of $${Number(camp.minimum_spend).toFixed(2)} is required for this coupon`,
      );
    }

    // Apply campaign reward based on campaign_type
    switch (camp.campaign_type) {
      case 'discount': {
        if (camp.discount_type === 'percent') {
          discount_amount = Math.round((net_amount * (Number(camp.discount_value) / 100)) * 100) / 100;
        } else if (camp.discount_type === 'fixed') {
          discount_amount = Math.min(Number(camp.discount_value), net_amount);
        }
        break;
      }
      case 'free_shipping': {
        free_shipping = true;
        break;
      }
      case 'bogo_same': {
        const targetItem = cart_items.find((i) => i.product_id === camp.buy_product_id);
        if (!targetItem || targetItem.quantity < (camp.buy_quantity || 1)) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `Requires purchasing at least ${camp.buy_quantity || 1} unit(s) of qualifying product`,
          );
        }
        const freeQty = Math.floor(targetItem.quantity / (camp.buy_quantity || 1)) * (camp.get_quantity || 1);
        if (freeQty > 0) {
          free_items.push({
            product_id: camp.buy_product_id,
            quantity: freeQty,
          });
        }
        break;
      }
      case 'bogo_different': {
        const targetItem = cart_items.find((i) => i.product_id === camp.buy_product_id);
        if (!targetItem || targetItem.quantity < (camp.buy_quantity || 1)) {
          throw new AppError(
            httpStatus.BAD_REQUEST,
            `Requires purchasing at least ${camp.buy_quantity || 1} unit(s) of qualifying product`,
          );
        }
        const freeQty = Math.floor(targetItem.quantity / (camp.buy_quantity || 1)) * (camp.get_quantity || 1);
        if (freeQty > 0 && camp.get_product_id) {
          free_items.push({
            product_id: camp.get_product_id,
            quantity: freeQty,
          });
        }
        break;
      }
      case 'free_item': {
        if (camp.get_product_id) {
          free_items.push({
            product_id: camp.get_product_id,
            quantity: camp.get_quantity || 1,
          });
        }
        break;
      }
    }

    applied_campaign = {
      id: camp.id,
      title: camp.title,
      campaign_type: camp.campaign_type,
      trigger_type: camp.trigger_type,
      coupon_code: formattedCode,
    };
  }

  // 2. CHECK AUTOMATIC CAMPAIGNS (e.g. Free Delivery over $50 or Gift item)
  const now = new Date();
  const [autoCampaigns] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM campaigns 
     WHERE trigger_type = 'automatic' 
       AND is_active = 1
       AND (start_date IS NULL OR start_date <= ?)
       AND (end_date IS NULL OR end_date >= ?)`,
    [now, now],
  );

  for (const autoCamp of autoCampaigns) {
    // Free Shipping automatic promotion
    if (autoCamp.campaign_type === 'free_shipping') {
      if (!autoCamp.minimum_spend || net_amount >= Number(autoCamp.minimum_spend)) {
        free_shipping = true;
      }
    }

    // Free Gift Item automatic promotion (if no manual coupon already claimed free items)
    if (autoCamp.campaign_type === 'free_item' && free_items.length === 0) {
      if (!autoCamp.minimum_spend || net_amount >= Number(autoCamp.minimum_spend)) {
        if (autoCamp.get_product_id) {
          free_items.push({
            product_id: autoCamp.get_product_id,
            quantity: autoCamp.get_quantity || 1,
          });
        }
      }
    }

    // Automatic discount (if no manual coupon is applied)
    if (autoCamp.campaign_type === 'discount' && !applied_campaign) {
      if (!autoCamp.minimum_spend || net_amount >= Number(autoCamp.minimum_spend)) {
        let autoDiscount = 0;
        if (autoCamp.discount_type === 'percent') {
          autoDiscount = Math.round((net_amount * (Number(autoCamp.discount_value) / 100)) * 100) / 100;
        } else if (autoCamp.discount_type === 'fixed') {
          autoDiscount = Math.min(Number(autoCamp.discount_value), net_amount);
        }

        if (autoDiscount > discount_amount) {
          discount_amount = autoDiscount;
          applied_campaign = {
            id: autoCamp.id,
            title: autoCamp.title,
            campaign_type: autoCamp.campaign_type,
            trigger_type: autoCamp.trigger_type,
          };
        }
      }
    }
  }

  // Fetch product names for free items if any
  if (free_items.length > 0) {
    const freeProductIds = free_items.map((i) => i.product_id);
    const [products] = await pool.query<RowDataPacket[]>(
      `SELECT id, name, images FROM products WHERE id IN (?)`,
      [freeProductIds],
    );
    const productMap = new Map(products.map((p) => [p.id, p]));

    free_items.forEach((item) => {
      const prod = productMap.get(item.product_id);
      if (prod) {
        item.name = prod.name;
        item.image = prod.images;
      }
    });
  }

  const total_amount = Math.max(0, net_amount - discount_amount);

  return {
    is_valid: true,
    applied_campaign,
    net_amount: Number(net_amount.toFixed(2)),
    discount_amount: Number(discount_amount.toFixed(2)),
    total_amount: Number(total_amount.toFixed(2)),
    free_shipping,
    free_items,
  };
};

export const CampaignServices = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  evaluateCartCampaigns,
};
