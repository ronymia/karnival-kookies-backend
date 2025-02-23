import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../../shared/mySQL';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';

//CREATE
const createFaq = async (payload: any) => {
  const { question, answer } = payload;
  // Insert new FAQ
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO faqs (question, answer) VALUES (?, ?)',
    [question, answer],
  );

  const newFaq = {
    id: result.insertId,
    question,
    answer,
  };

  return newFaq;
};

//GET ALL
const getAllFaq = async (
  filters: any,
  paginationOptions: TPaginationOptions,
) => {
  // Destructure pagination options
  const { page, limit, offset, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // GENERATE QUERY
  let query = 'SELECT * FROM faqs';

  // GENERATE WHERE QUERY
  let whereQuery = '';
  if (Object.keys(filters).length > 0) {
    whereQuery = Object.keys(filters)
      .map((key) => `${key} = ?`)
      .join(' AND ');
  }

  if (whereQuery) {
    query += ` WHERE ${whereQuery}`;
  }

  // SORT QUERY
  if (sortBy && sortOrder) {
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
  }

  // LIMIT QUERY
  if (limit && page) {
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  // EXECUTE THE QUERY
  const [faqs] = await pool.query<RowDataPacket[]>(
    query,
    Object.values(filters),
  );

  // Fetch total FAQ count
  const [totalFaqs] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM faqs',
  );

  //SEND TO CONTROLLER
  return {
    meta: {
      current_page: page,
      limit,
      total_pages: Math.ceil(totalFaqs[0]?.count / limit! || 0) || null,
      total: totalFaqs[0].count,
    },
    data: faqs,
  };
};

//UPDATE
const updateFaq = async (payload: any) => {
  const { id, question, answer } = payload;

  const result = await pool.query<ResultSetHeader>(
    'UPDATE faqs SET question = ?, answer = ? WHERE id = ?',
    [question, answer, id],
  );

  return result;
};

//DELETE
const deleteFaq = async (id: number) => {
  const result = await pool.query<ResultSetHeader>(
    'DELETE FROM faqs WHERE id = ?',
    [Number(id)],
  );
  return result;
};

export const FaqServices = { createFaq, getAllFaq, updateFaq, deleteFaq };
