import fs from 'node:fs';
import path from 'node:path';
import { mysqlcreateConnection } from '../../../config';
import { logger, errorLogger } from '../../../shared/logger';

const MIGRATIONS_DIR = path.join(process.cwd(), 'src/app/database/migrations');

async function migrate() {
  const connection = await mysqlcreateConnection;

  try {
    // 1. Create tracking table if not exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        batch INT NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Get executed migrations & current batch
    const [rows]: any = await connection.query(`SELECT name FROM _migrations`);
    const executed = new Set(rows.map((r: any) => r.name));

    const [batchRows]: any = await connection.query(`SELECT MAX(batch) as max_batch FROM _migrations`);
    const nextBatch = (batchRows[0].max_batch || 0) + 1;

    // 3. Find pending .up.sql files
    const allFiles = fs.readdirSync(MIGRATIONS_DIR).sort();
    const upFiles = allFiles.filter(f => f.endsWith('.up.sql'));

    let ranCount = 0;
    for (const file of upFiles) {
      const baseName = file.replace('.up.sql', '');
      if (!executed.has(baseName)) {
        logger.info(`Migrating: ${file}...`);
        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
        
        await connection.query(sql);
        await connection.query(
          `INSERT INTO _migrations (name, batch) VALUES (?, ?)`,
          [baseName, nextBatch]
        );
        ranCount++;
      }
    }

    if (ranCount === 0) {
      logger.info('Nothing to migrate. Database is up to date.');
    } else {
      logger.info(`Successfully executed ${ranCount} migration(s) in batch ${nextBatch}.`);
    }
  } catch (error) {
    errorLogger.error(error, 'Migration failed:');
    process.exit(1);
  } finally {
    await connection.end();
  }
}

migrate();