import fs from 'node:fs';
import path from 'node:path';
import { mysqlConnection } from '../../../config';

const MIGRATIONS_DIR = path.join(process.cwd(), 'src/app/database/migrations');

async function reset() {
  const connection = await mysqlConnection;

  try {
    const [rows]: any = await connection.query(
      `SELECT name FROM _migrations ORDER BY id DESC`
    );

    if (rows.length === 0) {
      console.log('Database is already empty.');
      return;
    }

    for (const row of rows) {
      const downFile = `${row.name}.down.sql`;
      const filePath = path.join(MIGRATIONS_DIR, downFile);

      if (fs.existsSync(filePath)) {
        console.log(`Reverting: ${downFile}...`);
        const sql = fs.readFileSync(filePath, 'utf8');
        await connection.query(sql);
      }
      await connection.query(`DELETE FROM _migrations WHERE name = ?`, [row.name]);
    }

    console.log('Database reset complete. All migrations removed.');
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

reset();