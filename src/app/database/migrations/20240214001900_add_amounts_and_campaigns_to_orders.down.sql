ALTER TABLE orders 
DROP FOREIGN KEY fk_orders_campaign,
DROP COLUMN free_shipping,
DROP COLUMN campaign_id,
DROP COLUMN coupon_code,
DROP COLUMN total_amount,
DROP COLUMN discount_amount,
DROP COLUMN net_amount;
