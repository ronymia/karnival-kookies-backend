import fs from 'node:fs';
import path from 'node:path';
import { mysqlcreateConnection } from '../../../config';
import { logger, errorLogger } from '../../../shared/logger';

const MIGRATIONS_DIR = path.join(process.cwd(), 'src/app/database/migrations');

async function rollback() {
  const connection = await mysqlcreateConnection;

  try {
    // 1. Find the latest batch number
    const [batchRows]: any = await connection.query(`SELECT MAX(batch) as max_batch FROM _migrations`);
    const latestBatch = batchRows[0]?.max_batch;

    if (!latestBatch) {
      logger.info('Nothing to rollback.');
      return;
    }

    // 2. Get migrations in that batch (in reverse order)
    const [rows]: any = await connection.query(
      `SELECT name FROM _migrations WHERE batch = ? ORDER BY id DESC`,
      [latestBatch]
    );

    for (const row of rows) {
      const downFile = `${row.name}.down.sql`;
      const filePath = path.join(MIGRATIONS_DIR, downFile);

      if (fs.existsSync(filePath)) {
        logger.info(`Rolling back: ${downFile}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await connection.query(sql);
      } else {
        logger.warn(`Warning: Down file ${downFile} not found. Skipping execution.`);
      }

      await connection.query(`DELETE FROM _migrations WHERE name = ?`, [row.name]);
    }

    logger.info(`Rolled back batch ${latestBatch} successfully.`);
  } catch (error) {
    errorLogger.error(error, 'Rollback failed:');
    process.exit(1);
  } finally {
    await connection.end();
  }
}

rollback();