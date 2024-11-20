import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  db_connection: process.env.DB_CONNECTION,
  db_host: process.env.DB_HOST,
  db_port: process.env.DB_PORT,
  db_database: process.env.DB_DATABASE,
  db_username: process.env.DB_USERNAME,
  db_password: process.env.DB_PASSWORD,
  default_student_pass: process.env.DEFAULT_STUDENT_PASS,
  default_faculty_pass: process.env.DEFAULT_FACULTY_PASS,
  default_admin_pass: process.env.DEFAULT_ADMIN_PASS,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  node_email: process.env.NODE_EMAIL,
  node_email_password: process.env.NODE_EMAILS_PASSWORD,
  stripe_key: process.env.STRIPE_SECRET_KEY,
  stripe_public_key: process.env.STRIPE_PUBLISHABLE_KEY,
  jwt: {
    access_token: process.env.ACCESS_TOKEN,
    refresh_token: process.env.REFRESH_TOKEN,
    access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
};
