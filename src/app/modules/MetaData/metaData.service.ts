import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../../shared/mySQL';
import { IMetaDataFilterableFields } from './metaData.interface';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';

// CREATE META DATA
const createMetaData = async (payload: any): Promise<any> => {
  // DESTRUCTURE
  const { meta_key, title, description } = payload;

  // INSERT INTO DB
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO meta_data (meta_key, title, description) VALUES (?, ?, ? )',
    [meta_key, title, description],
  );

  // SEND TO CONTROLLER
  return {
    id: result?.insertId,
    meta_key,
    title,
    description,
  };
};

// GET ALL META DATA
const getAllMetaData = async (
  filters: IMetaDataFilterableFields,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  // DESTRUCTURE
  const { page, limit, offset, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // GENERATE QUERY
  let query = `SELECT * FROM meta_data `;

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
  const [metadata] = await pool.query<RowDataPacket[]>(query, [
    ...Object.values(filters),
  ]);

  // Get the total count of meta_data entries
  const [totalMetaDataResult] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM meta_data',
  );

  // SEND TO CONTROLLER
  return {
    meta: {
      current_page: page,
      limit,
      total_pages:
        Math.ceil(totalMetaDataResult[0]?.count / limit! || 0) || null,
      total: totalMetaDataResult[0]?.count,
    },
    data: metadata,
  };
};

//  GET META DATA BY ID
const getMetaDataById = async (id: number): Promise<any> => {
  const [result] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM meta_data WHERE id = ?',
    [Number(id)],
  );

  return result;
};

// UPDATE META DATA
const updateMetaData = async (payload: any): Promise<any> => {
  const { id, meta_key, title, description } = payload;
  // Update
  const [result] = await pool.query<ResultSetHeader[]>(
    'UPDATE meta_data SET meta_key=?, title = ?, description = ? WHERE id = ?',
    [meta_key, title, description, id],
  );

  return result;
};

// DELETE META DATA
const deleteMetaData = async (ids: number[]): Promise<any> => {
  // GENERATE PLACEHOLDER FOR QUERY
  const placeholders = ids.map(() => '?');

  // DELETE QUERY
  const query = `DELETE FROM meta_data WHERE id IN (${placeholders})`;

  // EXECUTE QUERY
  const [result] = await pool.query<ResultSetHeader>(query, ids);

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
