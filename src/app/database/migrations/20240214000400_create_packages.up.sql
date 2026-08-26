CREATE TABLE packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT DEFAULT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount_type ENUM('fixed', 'percent') DEFAULT NULL, 
    discount_value DECIMAL(10,2) DEFAULT NULL, 
    images JSON NOT NULL,
    quantity INT NOT NULL,
    unit ENUM('kg', 'litre', 'pcs', 'bag') NOT NULL,
    is_discount_enable BOOLEAN DEFAULT 0 NOT NULL,
    status ENUM('in-stock', 'out-of-stock', 'discontinued') NOT NULL DEFAULT 'in-stock',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
