import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';
import { TMessage } from './message.interface';

const createMessage = async (payload: TMessage) => {
  const { name, email, message } = payload;
  // Insert new message into DB
  const [result] = (await pool.query(
    'INSERT INTO message (name, email, message, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    [name, email, message, new Date(), new Date()],
  )) as any[];

  return {
    id: result.insertId,
    name,
    email,
    message,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
const getAllMessages = async (
  filter: any,
  paginationOptions: TPaginationOptions,
) => {
  const {
    page,
    limit: perPage,
    skip,
    sortBy,
    sortOrder,
  } = paginationHelpers.calculatePagination(paginationOptions);
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
    meta: {
      page,
      limit: perPage,
      total: totalMessages,
    },
    data: messages,
  };
};
const deleteMessage = async (id: any) => {
  const [result] = (await pool.query('DELETE FROM message WHERE id = ?', [
    Number(id),
  ])) as any[];
  return result;
};

export const MessageServices = { createMessage, getAllMessages, deleteMessage };
