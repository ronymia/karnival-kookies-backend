import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import config from '../config';

const initDB = async () => {
  console.log('Starting database initialization...');

  try {
    // strict: false might be needed if not properly set in env, but let's try standard connection first
    // We connect without database selected first to create it
    const connection = await mysql.createConnection({
      host: config.db_host,
      port: Number(config.db_port),
      user: config.db_username,
      password: config.db_password,
    });

    console.log('Connected to MySQL server.');

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.db_database}\`;`,
    );
    console.log(`Database '${config.db_database}' check/creation completed.`);

    await connection.changeUser({ database: config.db_database });
    console.log(`Switched to database '${config.db_database}'.`);

    const schemaPath = path.join(process.cwd(), 'databaseSchema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('Schema file not found at:', schemaPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    // Split by semicolon but ignore semicolons inside quotes if possible,
    // but for simple schemas splitting by ';' usually works if no stored procs.
    // However, mysql2 supports multiple statements if enabled.
    // Let's try executing one by one for better error reporting.

    // Removing comments to avoid issues with splitting
    const statements = sql
      .split(/;\s*$/m)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      // Skip USE statement as we already selected DB
      if (statement.toLowerCase().startsWith('use ')) continue;

      try {
        await connection.query(statement);
      } catch (err: any) {
        // Ignore "Table already exists" errors if re-running
        if (err.code !== 'ER_TABLE_EXISTS_ERROR') {
          console.error(
            'Error executing statement:',
            statement.substring(0, 50) + '...',
            err.message,
          );
        }
      }
    }

    console.log('Schema applied successfully.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
};

initDB();
