import { ResultSetHeader } from 'mysql2';
import { pool } from '../../../shared/mySQL';
import { type TCreateCategoryType } from './categories.interface';

// CREATE
const createCategory = async (payload: TCreateCategoryType) => {
  const { name, description } = payload;

  // Correct SQL query with no trailing commas
  const [result] = (await pool.query<ResultSetHeader>(
    'INSERT INTO categories (name, description) VALUES (?, ?)',
    [name, description],
  )) as any[];

  return {
    id: result?.insertId,
    name,
    description,
  };
};

// GET ALL
const getAllCategories = async () => {
  // Fetch all categories
  const [categories] = await pool.query('SELECT * FROM categories');
  // Fetch total category count
  const [totalCategoriesResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM categories',
  )) as any[];
  const totalCategories = totalCategoriesResult[0].count;

  return {
    data: categories,
    total: totalCategories,
  };
};

//  GET BY ID
const getCategoryById = async () => {};

// UPDATE
const updateCategory = async (payload: TCreateCategoryType) => {
  const { id, name, description } = payload;
  // Update the category
  const [result] = (await pool.query(
    'UPDATE categories SET name = ?, description = ? WHERE id = ?',
    [name, description, id],
  )) as any[];

  return result;
};

// DELETE
const deleteCategory = async (id: number) => {
  // Delete category
  const result = await pool.query('DELETE FROM categories WHERE id = ?', [
    Number(id),
  ]);
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
