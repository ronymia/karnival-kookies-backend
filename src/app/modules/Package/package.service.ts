import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';
import { IPackage } from './package.interface';

// CREATE PACKAGE
const createPackage = async (payload: IPackage): Promise<any> => {
  const { name, description, regularPrice, discountPrice, isDiscountEnable } =
    payload;

  const [result] = (await pool.query(
    'INSERT INTO packages (name,description,regularPrice,discountPrice,isDiscountEnable) VALUES (?,?,?,?,?)',
    [name, description, regularPrice, discountPrice, isDiscountEnable],
  )) as any[];

  return { id: result?.insertId, ...payload };
};
// GET ALL PACKAGES
const getAllPackages = async (
  filters: any,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  const [result] = await pool.query('SELECT * FROM packages');
  return result;
};
// GET PACKAGE BY ID
const getPackageById = async (id: number): Promise<any> => {
  const [result] = await pool.query('SELECT * FROM packages WHERE id = ?', [
    Number(id),
  ]);

  return result;
};
// UPDATE PACKAGE
const updatePackage = async (payload: Partial<IPackage>): Promise<any> => {
  const {
    id,
    name,
    description,
    regularPrice,
    discountPrice,
    isDiscountEnable,
  } = payload;

  (await pool.query(
    `UPDATE packages 
   SET name = ?, description = ?, regularPrice = ?, discountPrice = ?, isDiscountEnable = ?
   WHERE id = ?`,
    [name, description, regularPrice, discountPrice, isDiscountEnable, id],
  )) as any[];

  return payload;
};
// DELETE PACKAGE
const deletePackage = async (ids: number[]): Promise<any> => {
  console.log({ first: ids });

  // GENERATE PLACEHOLDER FOR QUERY
  const placeholders = ids.map(() => '?');

  // DELETE QUERY
  const query = `DELETE FROM packages WHERE id IN (${placeholders})`;

  // EXECUTE QUERY
  const [result] = await pool.query(query, ids);

  return result;
};

export const PackageServices = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
};
