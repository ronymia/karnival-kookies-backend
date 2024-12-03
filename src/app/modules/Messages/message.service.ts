import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';
import { TMessage } from './message.interface';

// CREATE
const createMessage = async (payload: TMessage) => {
  const { name, email, message } = payload;
  // Insert new message into DB
  const [result] = (await pool.query(
    'INSERT INTO message (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
  )) as any[];

  return {
    id: result.insertId,
    name,
    email,
    message,
  };
};

// GET ALL
const getAllMessages = async (
  filter: any,
  paginationOptions: TPaginationOptions,
) => {
  const { page = 1, perPage = 10 } = paginationOptions;
  const offset = (page - 1) * perPage;
  // Get paginated messages
  const [messages] = await pool.query(
    'SELECT * FROM message LIMIT ? OFFSET ?',
    [Number(perPage), offset],
  );
  // Get total count of messages
  const [totalMessagesResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM message',
  )) as any[];
  const totalMessages = totalMessagesResult[0].count;

  //SEND TO CONTROLLER
  return {
    data: messages,
    total: totalMessages,
  };
};

// DELETE
const deleteMessage = async (id: any) => {
  const [result] = (await pool.query('DELETE FROM message WHERE id = ?', [
    Number(id),
  ])) as any[];
  return result;
};

export const MessageServices = { createMessage, getAllMessages, deleteMessage };
