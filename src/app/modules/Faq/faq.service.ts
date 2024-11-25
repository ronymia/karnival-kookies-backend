import { pool } from '../../../shared/mySQL';

//CREATE
const createFaq = async (payload: any) => {
  const { question, answer } = payload;
  // Insert new FAQ
  const [result] = (await pool.query(
    'INSERT INTO faq (question, answer, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
    [question, answer, new Date(), new Date()],
  )) as any[];
  const newFaq = {
    id: result.insertId,
    question,
    answer,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newFaq;
};

//GET ALL
const getAllFaq = async () => {
  // Fetch all FAQs
  const [faqs] = await pool.query('SELECT * FROM faq');
  // Fetch total FAQ count
  const [totalFaqsResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM faq',
  )) as any[];
  const totalFaqs = totalFaqsResult[0].count;

  //SEND TO CONTROLLER
  return {
    data: faqs,
    total: totalFaqs,
  };
};

//UPDATE
const updateFaq = async (payload: any) => {
  const { id, question, answer } = payload;

  const result = await pool.query(
    'UPDATE faq SET question = ?, answer = ?,  updatedAt = ? WHERE id = ?',
    [question, answer, new Date(), id],
  );

  return result;
};

//DELETE
const deleteFaq = async (id: number) => {
  const result = await pool.query('DELETE FROM faq WHERE id = ?', [Number(id)]);
  return result;
};

export const FaqServices = { createFaq, getAllFaq, updateFaq, deleteFaq };
