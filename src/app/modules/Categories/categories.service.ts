import { ResultSetHeader } from 'mysql2';
import { pool } from '../../../shared/mySQL';
import { type TCreateCategoryType } from './categories.interface';

// CREATE
const createCategory = async (payload: TCreateCategoryType) => {
  const { name, description } = payload;
  // Insert new category
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO category (name, description, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
    [name, description, new Date(), new Date()],
  );

  return {
    id: result?.insertId,
    name,
    description,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

// GET ALL
const getAllCategories = async () => {
  // Fetch all categories
  const [categories] = await pool.query('SELECT * FROM category');
  // Fetch total category count
  const [totalCategoriesResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM category',
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
  const { id, name, description, createdAt } = payload;
  // Update the category
  const result = await pool.query(
    'UPDATE category SET name = ?, description = ?, createdAt = ?, updatedAt = ? WHERE id = ?',
    [name, description, createdAt, new Date(), id],
  );

  return result;
};

// DELETE
const deleteCategory = async (id: number) => {
  // Delete category
  const result = await pool.query('DELETE FROM category WHERE id = ?', [
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
