import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../../shared/mySQL';
import { ICreateCategoryType } from './categories.interface';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { TPaginationOptions } from '../../../interfaces/pagination';

// CREATE
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

// GET ALL
const getAllCategories = async (
  filter: any,
  paginationOptions: TPaginationOptions,
) => {
  const { offset, page, limit } =
    paginationHelpers.calculatePagination(paginationOptions);

  let query = 'SELECT * FROM categories';
  const countQuery = 'SELECT COUNT(*) as count FROM categories';

  // Check if pagination is required
  if (limit && page) {
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }

  // Fetch categories
  const [categories] = await pool.query<RowDataPacket[]>(query);

  // Fetch total category count
  const [totalCategoriesResult] = await pool.query<RowDataPacket[]>(countQuery);

  // SEND TO CONTROLLER
  return {
    meta: {
      total: totalCategoriesResult[0].count || 0,
      page: page || 1, // Default to page 1 if not provided
      limit: limit || totalCategoriesResult[0].count, // Default to total count if not provided
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
const deleteCategory = async (id: number): Promise<any> => {
  // Delete category
  const result = await pool.query('DELETE FROM categories WHERE id = ?', [id]);
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
