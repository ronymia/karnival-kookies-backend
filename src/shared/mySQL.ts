import mysql from 'mysql2/promise';
import config from '../config';

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(config.db_port),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  connectTimeout: 20000, // Set timeout to 20 seconds
});
