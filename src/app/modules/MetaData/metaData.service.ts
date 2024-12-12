import { ResultSetHeader } from 'mysql2';
import { pool } from '../../../shared/mySQL';

// CREATE META DATA
const createMetaData = async (payload: any): Promise<any> => {
  const { url, title, description } = payload;

  // Correct SQL query with no trailing commas
  const [result] = (await pool.query<ResultSetHeader>(
    'INSERT INTO meta_data (url,title, description) VALUES (?, ?, ?)',
    [title, description],
  )) as any[];

  return {
    id: result?.insertId,
    url,
    title,
    description,
  };
};

// GET ALL META DATA
const getAllMetaData = async (url: any): Promise<any> => {
  // Initialize the query and parameters
  let query = `SELECT * FROM meta_data`;
  const params: any[] = [];

  // Add a WHERE clause if a URL is provided
  if (url) {
    query += ` WHERE url = ?`;
    params.push(url);
  }

  // Execute the main query
  const [metadata] = await pool.query(query, params);

  // Get the total count of meta_data entries
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

//  GET META DATA BY ID
const getMetaDataById = async (id: number): Promise<any> => {
  const [result] = await pool.query('SELECT * FROM meta_data WHERE id = ?', [
    Number(id),
  ]);

  return result;
};
//  GET META DATA BY URL
const getMetaDataByUrl = async (url: string): Promise<any> => {
  const [result] = await pool.query('SELECT * FROM meta_data WHERE url = ?', [
    url,
  ]);

  return result;
};

// UPDATE META DATA
const updateMetaData = async (payload: any): Promise<any> => {
  const { id, url, title, description } = payload;
  // Update
  const [result] = (await pool.query(
    'UPDATE meta_data SET url=?, title = ?, description = ? WHERE id = ?',
    [url, title, description, id],
  )) as any[];

  return result;
};

// DELETE META DATA
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
  getMetaDataByUrl,
  getAllMetaData,
  updateMetaData,
  deleteMetaData,
};
