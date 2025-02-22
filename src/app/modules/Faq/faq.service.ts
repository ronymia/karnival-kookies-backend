import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../../shared/mySQL';

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
const getAllFaq = async () => {
  // Fetch all FAQs
  const [faqs] = await pool.query<RowDataPacket[]>('SELECT * FROM faqs');
  // Fetch total FAQ count
  const [totalFaqsResult] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM faq',
  );
  const totalFaqs = totalFaqsResult[0].count;

  //SEND TO CONTROLLER
  return {
    meta: {
      current_page: 1,
      limit: 10,
      total_pages: Math.ceil(totalFaqs / 10),
      total: totalFaqs,
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
