import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import config from '../config';

const seedSuperAdmin = async () => {
  console.log('Starting superadmin seeding...');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: config.db_host,
      port: Number(config.db_port),
      user: config.db_username,
      password: config.db_password,
      database: config.db_database,
    });

    console.log(`Connected to database '${config.db_database}'.`);

    const email = 'mdronymia040@gmail.com';
    const password = config.default_admin_pass || '12345678@We';
    const role = 'admin';

    // 1. Check if super_admin already exists
    const [existingUsers]: any = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (existingUsers.length > 0) {
      console.log(`User with email '${email}' already exists. Skipping seed.`);
      await connection.end();
      return;
    }

    // 2. Hash password
    const saltRounds = Number(config.bcrypt_salt_rounds) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log('Inserting superadmin into users table...');

    // Start transaction
    await connection.beginTransaction();

    try {
      // 3. Insert into users table
      const [userResult]: any = await connection.query(
        'INSERT INTO users (email, password, role, status, is_email_verified) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, role, 'active', true],
      );

      const userId = userResult.insertId;

      console.log(`User created with ID: ${userId}. Inserting profile...`);

      // 4. Insert into profiles table
      await connection.query(
        'INSERT INTO profiles (user_id, name, gender, date_of_birth) VALUES (?, ?, ?, ?)',
        [userId, 'Super Admin', 'male', '1990-01-01'],
      );

      await connection.commit();
      console.log('Superadmin and profile seeded successfully.');
      console.log('-------------------------------------------');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('-------------------------------------------');
    } catch (err) {
      await connection.rollback();
      throw err;
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
};

seedSuperAdmin();
