import mysql from 'mysql2/promise';
import { envConfig } from '../config';

export const pool = mysql.createConnection({
    host: envConfig.db.db_host,
    user: envConfig.db.db_username,
    password: envConfig.db.db_password,
    database: envConfig.db.db_database,
    port: Number(envConfig.db.db_port),
    multipleStatements: true,
    connectTimeout: 1000 * 30, // Set timeout to 30 seconds
  });
