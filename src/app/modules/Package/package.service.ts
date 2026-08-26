import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { mysqlcreateConnection as pool } from '../../../config';
import { IPackage } from './package.interface';
import { paginationHelpers } from '../../../helpers/paginationHelpers';

// CREATE PACKAGE
const createPackage = async (payload: IPackage): Promise<any> => {
  const {
    name,
    description,
    price,
    discount_type,
    discount_value,
    images,
    quantity,
    unit,
    is_discount_enable,
  } = payload;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO packages (name, description, price, discount_type, discount_value, images, quantity, unit, is_discount_enable) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      price,
      discount_type,
      discount_value,
      JSON.stringify(images),
      quantity,
      unit,
      is_discount_enable,
    ],
  );

  return { id: result?.insertId, ...payload };
};
// GET ALL PACKAGES
const getAllPackages = async (
  filters: any,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  const { page, limit, offset } =
    paginationHelpers.calculatePagination(paginationOptions);

  // Fetch only required fields with net_price calculation
  let query = `
      SELECT 
        p.*,
        CASE 
          WHEN p.is_discount_enable = 1 THEN 
            CASE 
              WHEN p.discount_type = 'fixed' THEN p.price - p.discount_value
              WHEN p.discount_type = 'percent' THEN p.price - (price * p.discount_value / 100)
              ELSE p.price
            END
          ELSE p.price
        END AS net_price
      FROM packages p
    `;

  const queryParams: any[] = [];

  // Apply pagination only if page & limit exist
  if (page && limit && offset) {
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);
  }

  const [result] = await pool.query<RowDataPacket[]>(query, queryParams);

  // GET TOTAL PACKAGE COUNT
  const [totalPackagesResult] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM packages',
  );

  return {
    meta: {
      current_page: page,
      limit,
      total: totalPackagesResult[0]?.count,
      total_page: Math.ceil(totalPackagesResult[0]?.count / limit! || 0),
    },
    data: result,
  };
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
    price,
    discount_value,
    discount_type, // Added discount type (fixed or percent)
    images,
    quantity,
    unit, // Added unit
    is_discount_enable,
    status,
  } = payload;

  // EXECUTE QUERY
  const [result] = await pool.query<ResultSetHeader>(
    `UPDATE packages 
     SET name = ?, 
         description = ?, 
         price = ?, 
         discount_value = ?, 
         discount_type = ?, 
         images = ?, 
         quantity = ?, 
         unit = ?, 
         is_discount_enable = ?, 
         status = ?
     WHERE id = ?`,
    [
      name,
      description,
      price,
      discount_value,
      discount_type,
      JSON.stringify(images),
      quantity,
      unit,
      is_discount_enable,
      status,
      id,
    ],
  );

  return result;
};
// DELETE PACKAGE
const deletePackage = async (ids: number[]): Promise<any> => {
  // GENERATE PLACEHOLDER FOR QUERY
  const placeholders = ids.map(() => '?');

  // DELETE QUERY
  const query = `DELETE FROM packages WHERE id IN (${placeholders})`;

  // EXECUTE QUERY
  const [result] = await pool.query(query, ids);

  return result;
};

// UPLOAD PACKAGE IMAGES
const uploadPackageFiles = async (files: any) => {
  // ARRAY OF FILES
  const uploadableFiles = files?.map((file: any) => file?.file);

  return uploadableFiles;
};

export const PackageServices = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  uploadPackageFiles,
};
