import { ResultSetHeader } from 'mysql2';
import { pool } from '../../../shared/mySQL';

// CREATE
const createMetaData = async (payload: any): Promise<any> => {
  const { title, description } = payload;

  // Correct SQL query with no trailing commas
  const [result] = (await pool.query<ResultSetHeader>(
    'INSERT INTO meta_data (title, description) VALUES (?, ?)',
    [title, description],
  )) as any[];

  return {
    id: result?.insertId,
    title,
    description,
  };
};

// GET ALL
const getAllMetaData = async (): Promise<any> => {
  // Fetch all categories
  const [metadata] = await pool.query('SELECT * FROM meta_data');
  // Fetch total category count
  const [totalMetaDataResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM meta_data',
  )) as any[];
  const totalMetaData = totalMetaDataResult[0].count;

  return {
    meta: {
      total: totalMetaData,
    },
    data: metadata,
  };
};

//  GET BY ID
const getMetaDataById = async (id: number): Promise<any> => {
  const [result] = await pool.query('SELECT * FROM meta_data WHERE id = ?', [
    Number(id),
  ]);

  return result;
};

// UPDATE
const updateMetaData = async (payload: any): Promise<any> => {
  const { id, title, description } = payload;
  // Update
  const [result] = (await pool.query(
    'UPDATE meta_data SET title = ?, description = ? WHERE id = ?',
    [title, description, id],
  )) as any[];

  return result;
};

// DELETE
const deleteMetaData = async (ids: number[]): Promise<any> => {
  // GENERATE PLACEHOLDER FOR QUERY
  const placeholders = ids.map(() => '?');

  // DELETE QUERY
  const query = `DELETE FROM meta_data WHERE id IN (${placeholders})`;

  // EXECUTE QUERY
  const [result] = await pool.query(query, ids);

  return result;
};

//
export const MetaDataServices = {
  createMetaData,
  getMetaDataById,
  getAllMetaData,
  updateMetaData,
  deleteMetaData,
};
