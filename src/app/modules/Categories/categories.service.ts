import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { mysqlcreateConnection as pool } from '../../../config';
import { ICreateCategoryType } from './categories.interface';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { TPaginationOptions } from '../../../interfaces/pagination';

// CREATE A NEW CATEGORY
const createCategory = async (
  payload: ICreateCategoryType,
): Promise<ICreateCategoryType> => {
  const { name, description } = payload;

  // INSERT INTO DB
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description],
  );
  // SEND TO CONTROLLER
  return {
    id: result?.insertId,
    name,
    description,
  };
};

// GET ALL CATEGORIES
const getAllCategories = async (
  filter: any,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  // Destructure pagination options
  const { offset, page, limit } =
    paginationHelpers.calculatePagination(paginationOptions);

  // BUILD THE QUERY
  let query = 'SELECT * FROM categories';
  const countQuery = 'SELECT COUNT(*) as count FROM categories';

  // CHECK THE PAGINATION REQUIREMENTS
  if (limit && page) {
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  // FETCH CATEGORIES
  const [categories] = await pool.query<RowDataPacket[]>(query);

  // FETCH TOTAL CATEGORY COUNT
  const [totalCategoriesResult] = await pool.query<RowDataPacket[]>(countQuery);

  // SEND TO CONTROLLER
  return {
    meta: {
      total: totalCategoriesResult[0].count || 0,
      current_page: page,
      limit,
      total_page:
        Math.ceil(totalCategoriesResult[0].count / limit! || 0) || null,
    },
    data: categories,
  };
};

//  GET BY ID
const getCategoryById = async () => {};

// UPDATE
const updateCategory = async (
  payload: ICreateCategoryType,
): Promise<ICreateCategoryType> => {
  const { id, name, description } = payload;
  // Update the category
  const [result] = await pool.query<ResultSetHeader>(
    'UPDATE categories SET name = ?, description = ? WHERE id = ?',
    [name, description, id],
  );

  return { id: result?.insertId, ...payload };
};

// DELETE
const deleteCategory = async (ids: number[]): Promise<any> => {
  // GENERATE PLACEHOLDER FOR QUERY
  const placeholders = ids.map(() => '?');

  // DELETE QUERY
  const query = `DELETE FROM categories WHERE id IN (${placeholders})`;
  // EXECUTE QUERY
  const [result] = await pool.query(query, ids);

  return result;
};

//
export const CategoryServices = {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
};
