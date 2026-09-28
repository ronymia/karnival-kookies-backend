ALTER TABLE orders 
ADD COLUMN net_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER tracking_number,
ADD COLUMN discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER net_amount,
ADD COLUMN total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER discount_amount,
ADD COLUMN coupon_code VARCHAR(100) DEFAULT NULL AFTER total_amount,
ADD COLUMN campaign_id INT DEFAULT NULL AFTER coupon_code,
ADD COLUMN free_shipping BOOLEAN DEFAULT 0 AFTER campaign_id,
ADD CONSTRAINT fk_orders_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE SET NULL;
