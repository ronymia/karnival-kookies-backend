import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { envConfig } from '../config';

const migrate = async () => {
  console.log('Starting database migrations...');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: envConfig.db.db_host,
      port: Number(envConfig.db.db_port),
      user: envConfig.db.db_username,
      password: envConfig.db.db_password,
      database: envConfig.db.db_database, // Connect specifically to the DB
      multipleStatements: true, // Allow multiple statements in one query if supported/needed
    });

    console.log(`Connected to database '${envConfig.db.db_database}'.`);

    // 1. Create migrations table if it doesn't exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Get list of applied migrations
    const [rows]: any = await connection.query(
      'SELECT filename FROM _migrations',
    );
    const appliedMigrations = new Set(rows.map((row: any) => row.filename));

    // 3. Read migration files
    const migrationsDir = path.join(process.cwd(), 'src', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found. Accessing src/migrations...');
      fs.mkdirSync(migrationsDir, { recursive: true });
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort(); // Sorts by filename (important for order!)

    if (files.length === 0) {
      console.log('No migration files found.');
      await connection.end();
      return;
    }

    // 4. Apply new migrations
    for (const file of files) {
      if (appliedMigrations.has(file)) {
        continue; // Skip already applied
      }

      console.log(`Applying migration: ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      // Execute the migration
      // Using a transaction is safer to ensure atomic application per file
      await connection.beginTransaction();
      try {
        await connection.query(sql);
        await connection.query(
          'INSERT INTO _migrations (filename) VALUES (?)',
          [file],
        );
        await connection.commit();
        console.log(`Successfully applied: ${file}`);
      } catch (err) {
        await connection.rollback();
        console.error(`Failed to apply migration ${file}:`, err);
        throw err; // Stop execution on failure
      }
    }

    console.log('All migrations applied successfully.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
};

migrate();
