import { ResultSetHeader } from 'mysql2';
import { mysqlcreateConnection as pool } from '../../../config';
import { IFavoriteProduct } from './favoriteProduct.interface';

// ADD FAVORITE PRODUCT
const addFavoriteProduct = async (
  payload: IFavoriteProduct,
): Promise<IFavoriteProduct> => {
  //
  const { user_id, product_id } = payload;

  // ADD INTO DATABASE
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO favorite_products (user_id, product_id) VALUES (?, ?)`,
    [user_id, product_id],
  );

  return {
    id: result?.insertId,
    user_id,
    product_id,
  };
};

// REMOVE FAVORITE PRODUCT
const removeFavoriteProduct = async (
  payload: IFavoriteProduct,
): Promise<any> => {
  const { user_id, product_id } = payload;

  // DELETE FROM DATABASE
  const result = await pool.query<ResultSetHeader>(
    `DELETE FROM favorite_products WHERE user_id = ? AND product_id = ?`,
    [user_id, product_id],
  );

  return result;
};

export const FavoriteProductServices = {
  addFavoriteProduct,
  removeFavoriteProduct,
};
