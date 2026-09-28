import mysql from 'mysql2/promise';
import { envConfig } from './env.config';

export const mysqlcreateConnection = mysql.createPool({
  host: envConfig.db.db_host,
  user: envConfig.db.db_username,
  password: envConfig.db.db_password,
  database: envConfig.db.db_database,
  port: Number(envConfig.db.db_port),
  multipleStatements: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 1000 * 30, // 30 seconds
});

