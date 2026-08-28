import bcrypt from 'bcrypt';
import { envConfig, mysqlcreateConnection } from '../config';
import { errorLogger, logger } from '../shared/logger';

const seedSuperAdmin = async () => {
  logger.info('Starting superadmin seeding...');

  let connection;
  try {
    const pool = mysqlcreateConnection;
    logger.info(`Connected to database '${envConfig.db.db_database}'.`);

    const email = 'mdronymia040@gmail.com';
    const password = envConfig.defaultPassword.default_admin_pass || '12345678@We';
    const role = 'admin';

    // 1. Check if super_admin already exists
    const [existingUsers]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email],
    );

    if (existingUsers.length > 0) {
      logger.info(`User with email '${email}' already exists. Skipping seed.`);
      await pool.end();
      return;
    }

    // 2. Hash password
    const saltRounds = Number(envConfig.bcrypt_salt_rounds) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    logger.info('Inserting superadmin into users table...');

    // Acquire connection for transaction
    connection = await pool.getConnection();
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
    } finally {
      connection.release();
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    errorLogger.error(error, 'Seeding failed:');
    if (connection) {
      try {
        connection.release();
      } catch (_) {}
    }
    await mysqlcreateConnection.end();
    process.exit(1);
  }
};

seedSuperAdmin();
