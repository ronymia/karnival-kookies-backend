import bcrypt from 'bcrypt';
import { envConfig, mysqlcreateConnection } from '../config';
import { errorLogger, logger } from '../shared/logger';

const seedSuperAdmin = async () => {
  logger.info('Starting superadmin seeding...');

  let connection;
  try {
    connection = await mysqlcreateConnection;

    logger.info(`Connected to database '${envConfig.db.db_database}'.`);

    const email = 'mdronymia040@gmail.com';
    const password = envConfig.defaultPassword.default_admin_pass || '12345678@We';
    const role = 'admin';

    // 1. Check if super_admin already exists
    const [existingUsers]: any = await connection.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (existingUsers.length > 0) {
      logger.info(`User with email '${email}' already exists. Skipping seed.`);
      await connection.end();
      return;
    }

    // 2. Hash password
    const saltRounds = Number(envConfig.bcrypt_salt_rounds) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    logger.info('Inserting superadmin into users table...');

    // Start transaction
    await connection.beginTransaction();

    try {
      // 3. Insert into users table
      const [userResult]: any = await connection.query(
        'INSERT INTO users (email, password, role, status, is_email_verified) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, role, 'active', true],
      );

      const userId = userResult.insertId;

      logger.info(`User created with ID: ${userId}. Inserting profile...`);

      // 4. Insert into profiles table
      await connection.query(
        'INSERT INTO profiles (user_id, name, gender, date_of_birth) VALUES (?, ?, ?, ?)',
        [userId, 'Super Admin', 'male', '1990-01-01'],
      );

      await connection.commit();
      logger.info('Superadmin and profile seeded successfully.');
      logger.info('-------------------------------------------');
      logger.info(`Email: ${email}`);
      logger.info(`Password: ${password}`);
      logger.info('-------------------------------------------');
    } catch (err) {
      await connection.rollback();
      throw err;
    }

    await connection.end();
    process.exit(0);
  } catch (error) {
    errorLogger.error(error, 'Seeding failed:');
    if (connection) await connection.end();
    process.exit(1);
  }
};

seedSuperAdmin();
