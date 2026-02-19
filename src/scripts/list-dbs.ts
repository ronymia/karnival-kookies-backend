import mysql from 'mysql2/promise';
import config from '../config';

const listDBs = async () => {
  try {
    const connection = await mysql.createConnection({
      host: config.db_host,
      port: Number(config.db_port),
      user: config.db_username,
      password: config.db_password,
    });

    console.log(`Connected to ${config.db_host}`);
    const [rows] = await connection.query('SHOW DATABASES;');
    console.table(rows);

    await connection.end();
  } catch (error) {
    console.error('Error listing databases:', error);
  }
};

listDBs();
