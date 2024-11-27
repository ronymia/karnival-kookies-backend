import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';

// CREATE SUBSCRIBERS
const createSubscribers = async (payload: { email: string }): Promise<any> => {
  const subscribed_at = new Date();
  const [result] = (await pool.query(
    `INSERT INTO subscribers (email, subscribed_at) VALUES (?, ?)`,
    [payload?.email, subscribed_at],
  )) as any[];

  return {
    id: result?.insertId,
    email: payload?.email,
    subscribed_at,
  };
};

// GET ALL SUBSCRIBERS
const getAllSubscribers = async (
  filters: any,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  const [result] = await pool.query(`SELECT * FROM subscribers`);
  return result;
};

//
export const SubscriberServices = { createSubscribers, getAllSubscribers };
