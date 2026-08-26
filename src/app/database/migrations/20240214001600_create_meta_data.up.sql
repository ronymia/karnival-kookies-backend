CREATE TABLE meta_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meta_key VARCHAR(100) NOT NULL,  -- Helps categorize metadata (e.g., 'homepage', 'product_page', 'blog_post')
    title VARCHAR(255) NOT NULL,  -- Optimized for shorter titles
    description TEXT NOT NULL,  -- Use TEXT unless you need very long descriptions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
