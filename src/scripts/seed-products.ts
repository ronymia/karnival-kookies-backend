import { envConfig, mysqlcreateConnection } from '../config';
import { errorLogger, logger } from '../shared/logger';

const seedProductsAndPackages = async () => {
  logger.info('Starting product and package seeding...');

  let connection;
  try {
    connection = mysqlcreateConnection;

    logger.info(`Connected to database '${envConfig.db.db_database}'.`);

    // 1. Seed Categories
    const categories = [
      { name: 'Cakes', description: 'Delicious freshly baked cakes' },
      { name: 'Cookies', description: 'Crunchy and chewy cookies' },
      { name: 'Pastries', description: 'Flaky and buttery pastries' },
      { name: 'Drinks', description: 'Refreshing beverages' },
    ];

    const categoryIds: Record<string, number> = {};

    for (const cat of categories) {
      const [rows]: any = await connection.query(
        'SELECT id FROM categories WHERE name = ?',
        [cat.name],
      );

      if (rows.length > 0) {
        categoryIds[cat.name] = rows[0].id;
      } else {
        const [result]: any = await connection.query(
          'INSERT INTO categories (name, description) VALUES (?, ?)',
          [cat.name, cat.description],
        );
        categoryIds[cat.name] = result.insertId;
        logger.info(`Seeded Category: ${cat.name}`);
      }
    }

    // 2. Seed Products (10 items)
    const products = [
      {
        name: 'Chocolate Lava Cake',
        category: 'Cakes',
        price: 15.99,
        quantity: 50,
        unit: 'pcs',
        images: JSON.stringify(['products/chocolate_lava_cake.jpg']),
        description: 'Rich chocolate cake with a molten center.',
      },
      {
        name: 'Red Velvet Cake',
        category: 'Cakes',
        price: 18.5,
        quantity: 30,
        unit: 'pcs',
        images: JSON.stringify(['products/red_velvet_cake.jpg']),
        description: 'Classic red velvet with cream cheese frosting.',
      },
      {
        name: 'Cheesecake Slice',
        category: 'Cakes',
        price: 8.0,
        quantity: 40,
        unit: 'pcs',
        images: JSON.stringify(['products/cheesecake_slice.jpg']),
        description: 'Creamy New York style cheesecake.',
      },
      {
        name: 'Choco Chip Cookies',
        category: 'Cookies',
        price: 12.0,
        quantity: 100,
        unit: 'bag',
        images: JSON.stringify(['products/choco_chip_cookies.jpg']),
        description: 'Pack of 6 classic chocolate chip cookies.',
      },
      {
        name: 'Oatmeal Raisin Cookies',
        category: 'Cookies',
        price: 10.0,
        quantity: 80,
        unit: 'bag',
        images: JSON.stringify(['products/oatmeal_raisin_cookies.jpg']),
        description: 'Healthy and tasty oatmeal raisin cookies.',
      },
      {
        name: 'Macarons Box',
        category: 'Cookies',
        price: 25.0,
        quantity: 20,
        unit: 'pcs',
        images: JSON.stringify(['products/macarons_box.jpg']),
        description: 'Assorted french macarons.',
      },
      {
        name: 'Croissant',
        category: 'Pastries',
        price: 3.5,
        quantity: 50,
        unit: 'pcs',
        images: JSON.stringify(['products/croissant.jpg']),
        description: 'Buttery french croissant.',
      },
      {
        name: 'Danish Pastry',
        category: 'Pastries',
        price: 4.0,
        quantity: 40,
        unit: 'pcs',
        images: JSON.stringify(['products/danish_pastry.jpg']),
        description: 'Fruit filled danish pastry.',
      },
      {
        name: 'Iced Coffee',
        category: 'Drinks',
        price: 5.0,
        quantity: 100,
        unit: 'pcs',
        images: JSON.stringify(['products/iced_coffee.jpg']),
        description: 'Cold brew iced coffee.',
      },
      {
        name: 'Fruit Smoothie',
        category: 'Drinks',
        price: 6.5,
        quantity: 60,
        unit: 'pcs',
        images: JSON.stringify(['products/fruit_smoothie.jpg']),
        description: 'Fresh mixed berry smoothie.',
      },
    ];

    for (const prod of products) {
      const [rows]: any = await connection.query(
        'SELECT id FROM products WHERE name = ?',
        [prod.name],
      );

      if (rows.length === 0) {
        await connection.query(
          `INSERT INTO products 
          (name, category_id, price, quantity, unit, images, description, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 'in-stock')`,
          [
            prod.name,
            categoryIds[prod.category],
            prod.price,
            prod.quantity,
            prod.unit,
            prod.images,
            prod.description,
          ],
        );
        logger.info(`Seeded Product: ${prod.name}`);
      }
    }

    // 3. Seed Packages (5 items)
    const packages = [
      {
        name: 'Family Feast Bundle',
        price: 55.0,
        discount_type: 'percent',
        discount_value: 10,
        quantity: 10,
        unit: 'pcs',
        images: JSON.stringify(['packages/family_feast_bundle.jpg']),
        description: 'A large cake, 12 cookies, and 4 drinks.',
      },
      {
        name: 'Birthday Party Pack',
        price: 80.0,
        discount_type: 'fixed',
        discount_value: 15,
        quantity: 5,
        unit: 'pcs',
        images: JSON.stringify(['packages/birthday_party_pack.jpg']),
        description: 'Two cakes and a box of macarons.',
      },
      {
        name: 'Breakfast Combo',
        price: 12.0,
        discount_type: 'percent',
        discount_value: 5,
        quantity: 20,
        unit: 'pcs',
        images: JSON.stringify(['packages/breakfast_combo.jpg']),
        description: 'Croissant + Coffee.',
      },
      {
        name: 'Cookie Lovers Box',
        price: 30.0,
        discount_type: 'percent',
        discount_value: 15,
        quantity: 15,
        unit: 'pcs',
        images: JSON.stringify(['packages/cookie_lovers_box.jpg']),
        description: 'Assortment of 30 cookies.',
      },
      {
        name: 'Picnic Basket',
        price: 45.0,
        discount_type: 'fixed',
        discount_value: 5,
        quantity: 8,
        unit: 'pcs',
        images: JSON.stringify(['packages/picnic_basket.jpg']),
        description: 'Sandwiches (not seeded), pastries, and drinks.',
      },
    ];

    for (const pkg of packages) {
      const [rows]: any = await connection.query(
        'SELECT id FROM packages WHERE name = ?',
        [pkg.name],
      );

      if (rows.length === 0) {
        await connection.query(
          `INSERT INTO packages 
          (name, price, discount_type, discount_value, quantity, unit, images, description, status, is_discount_enable) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'in-stock', true)`,
          [
            pkg.name,
            pkg.price,
            pkg.discount_type,
            pkg.discount_value,
            pkg.quantity,
            pkg.unit,
            pkg.images,
            pkg.description,
          ],
        );
        logger.info(`Seeded Package: ${pkg.name}`);
      }
    }

    logger.info('Seeding completed successfully.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    errorLogger.error(error, 'Seeding failed:');
    if (connection) await connection.end();
    process.exit(1);
  }
};

seedProductsAndPackages();
