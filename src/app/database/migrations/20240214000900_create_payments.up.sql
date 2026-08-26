CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    transaction_id VARCHAR(50) NOT NULL UNIQUE,
    stripe_payment_intent_id VARCHAR(255) DEFAULT NULL,
    stripe_payment_method_id VARCHAR(255) DEFAULT NULL,
    amount DECIMAL(10,2) NOT NULL,
    method ENUM('cash', 'card', 'bank', 'online', 'stripe') NOT NULL,  -- Added 'stripe' as a method
    status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
