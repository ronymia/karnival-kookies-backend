import dotenv from 'dotenv';
import * as path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), '.env') });




export const envConfig = {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  url:{
    frontend: process.env.FRONTEND_URL,
    backend: process.env.BACKEND_URL,
  },
  db:{
    database_url: process.env.DATABASE_URL,
    db_connection: process.env.DB_CONNECTION,
    db_host: process.env.DB_HOST,
    db_port: process.env.DB_PORT,
    db_database: process.env.DB_DATABASE,
    db_username: process.env.DB_USERNAME,
    db_password: process.env.DB_PASSWORD,
  },
  nodeMailer:{
    node_email: process.env.NODE_EMAIL,
    node_email_password: process.env.NODE_EMAILS_PASSWORD,
  },
  stripe:{
    key: process.env.STRIPE_SECRET_KEY,
    public_key: process.env.STRIPE_PUBLISHABLE_KEY,
  },
  jwt: {
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  defaultPassword:{
    default_admin_pass: process.env.DEFAULT_ADMIN_PASS,
  },
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
};
