ALTER TABLE coupon_usages
DROP FOREIGN KEY fk_usages_campaign,
DROP COLUMN campaign_id;

ALTER TABLE coupons
DROP FOREIGN KEY fk_coupons_campaign,
DROP COLUMN campaign_id;
