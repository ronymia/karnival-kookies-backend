USE karnival_kookies;

-- USERS
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    code VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    isVerified BOOLEAN NOT NULL DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PROFILE

-- CATEGORY
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
-- PRODUCT
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT DEFAULT NULL,
    regular_price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) DEFAULT NULL,
    images TEXT NOT NULL,
    category_id INT NOT NULL,
    quantity INT NOT NULL,
    unit ENUM('kg', 'litre', 'pcs', 'bag') NOT NULL,
    is_active BOOLEAN DEFAULT 1 NOT NULL,
    is_discount_enable BOOLEAN DEFAULT 0 NOT NULL,
    status enum(
        "in-stock",
        "out-of-stock",
        "discontinued"
    ) NOT NULL DEFAULT "in-stock",
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

-- STOCK
CREATE TABLE stocks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    productId INT NOT NULL,
    


) 
-- MESSAGE
CREATE TABLE message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message LONGTEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- FAQ
CREATE TABLE faqs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question VARCHAR(255) NOT NULL,
    answer LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- CART
CREATE TABLE carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
);

-- ORDERS
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    tracking_number VARCHAR(50) NOT NULL,
    shipping_info JSON NOT NULL,
    payment_info JSON NOT NULL,
    payment_method ENUM(
        'cash',
        'card',
        'bank',
        'online'
    ) NOT NULL,
    status ENUM(
        'pending',
        'confirmed',
        'preparing',
        'shipped',
        'delivered',
        'cancelled'
    ) NOT NULL DEFAULT 'pending',
    status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    delivery_time TIMESTAMP DEFAULT NULL,
    notes LONGTEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE
);

-- Order Items table
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL, -- Add product price at the time of the order
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
)
-- DISCOUNT
CREATE TABLE coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE,
    discount_type enum('percentage', 'fixed') NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    minimum_spend DECIMAL(10, 2) NOT NULL,
    used BOOLEAN DEFAULT 0 NOT NULL,
);

CREATE TABLE coupon_usages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coupon_id INT NOT NULL,
    user_id INT NOT NULL, -- Assuming you have a users table
    order_id INT NOT NULL, -- Assuming you have an orders table
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE CASCADE
);

-- REVIEW
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    comment LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE,
);

-- NEWSLETTERS
CREATE TABLE subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description LONGTEXT,
    regular_price DECIMAL(10, 2) NOT NULL,
    discount_price DECIMAL(10, 2) DEFAULT NULL,
    quantity INT NOT NULL,
    unit ENUM('kg', 'litre', 'pcs', 'bag') NOT NULL,
    is_discount_enable BOOLEAN DEFAULT 0 NOT NULL,
    status enum(
        "in-stock",
        "out-of-stock",
        "discontinued"
    ) NOT NULL DEFAULT "in-stock",
    images TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- FAVORITE PRODUCT TABLE
CREATE TABLE favorite_products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product (id) ON DELETE CASCADE
);