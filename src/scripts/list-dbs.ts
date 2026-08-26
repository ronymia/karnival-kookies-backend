import mysql from 'mysql2/promise';
import { envConfig } from '../config';

const listDBs = async () => {
  try {
    const connection = await mysql.createConnection({
      host: envConfig.db.db_host,
      port: Number(envConfig.db.db_port),
      user: envConfig.db.db_username,
      password: envConfig.db.db_password,
    });

    console.log(`Connected to ${envConfig.db.db_host}`);
    const [rows] = await connection.query('SHOW DATABASES;');
    console.table(rows);

    await connection.end();
  } catch (error) {
    console.error('Error listing databases:', error);
  }
};

listDBs();
