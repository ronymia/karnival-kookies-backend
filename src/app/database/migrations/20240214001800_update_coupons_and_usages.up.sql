ALTER TABLE coupons
ADD COLUMN campaign_id INT DEFAULT NULL AFTER id,
MODIFY COLUMN discount_type ENUM('percent', 'fixed') DEFAULT NULL,
MODIFY COLUMN discount_value DECIMAL(10, 2) DEFAULT NULL,
ADD CONSTRAINT fk_coupons_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE;

ALTER TABLE coupon_usages
ADD COLUMN campaign_id INT DEFAULT NULL AFTER id,
MODIFY COLUMN coupon_id INT DEFAULT NULL,
ADD CONSTRAINT fk_usages_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE;
