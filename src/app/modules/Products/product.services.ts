import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';
import { TProduct } from './product.interface';

// CREATE PRODUCT
const createProduct = async (payload: TProduct): Promise<any> => {
  const {
    name,
    description,
    regular_price,
    discount_price,
    images,
    category_id,
    quantity,
    is_discount_enable,
    status,
  } = payload;
  const [result] = (await pool.query(
    'INSERT INTO products (name, description, regular_price, discount_price, images, category_id, quantity, is_discount_enable, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      name,
      description,
      regular_price,
      discount_price,
      JSON.stringify(images),
      category_id,
      quantity,
      is_discount_enable,
      status,
    ],
  )) as any[];

  const newProduct = {
    id: result.insertId,
    name,
    description,
    regular_price,
    discount_price,
    images,
    category_id,
    quantity,
    is_discount_enable,
    status,
  };

  return newProduct;
};

// GET ALL PRODUCT
const getAllClientProducts = async (
  filter: any,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  const {
    category_id,
    fromPrice,
    toPrice,
    sortByNewest,
    HighToLow,
    lowToHigh,
    searchTerm,
  } = filter;

  const {
    page,
    limit,
    sortBy = 'created_at',
    sortOrder = 'ASC',
  } = paginationOptions;

  const offset = (Number(page) - 1) * Number(limit);

  // Base query for products
  let query = `
    SELECT 
      p.*, 
      COALESCE(p.discount_price, p.regular_price) AS effective_price,
      JSON_OBJECT(
        'id', c.id,
        'name', c.name,
        'description', c.description,
        'created_at', c.created_at,
        'updated_at', c.updated_at
      ) AS category,
      JSON_ARRAYAGG(fp.user_id) AS favorite_users
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN favorite_products fp ON p.id = fp.product_id
  `;

  // Base query for total count
  let countQuery = `
    SELECT 
      COUNT(DISTINCT p.id) AS total_count
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    LEFT JOIN favorite_products fp ON p.id = fp.product_id
  `;

  // WHERE conditions
  const whereConditions: string[] = [];
  const values: any[] = [];

  if (category_id) {
    whereConditions.push('p.category_id = ?');
    values.push(category_id);
  }

  if (fromPrice) {
    whereConditions.push('COALESCE(p.discount_price, p.regular_price) >= ?');
    values.push(fromPrice);
  }

  if (toPrice) {
    whereConditions.push('COALESCE(p.discount_price, p.regular_price) <= ?');
    values.push(toPrice);
  }

  if (searchTerm) {
    whereConditions.push(
      `(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`,
    );
    const term = `%${searchTerm}%`;
    values.push(term, term, term);
  }

  // Add WHERE clause to both queries if conditions exist
  if (whereConditions.length > 0) {
    const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
    query += whereClause;
    countQuery += whereClause;
  }

  // GROUP BY for product query
  query += ` GROUP BY p.id`;

  // Sorting
  if (sortByNewest) {
    query += ` ORDER BY p.created_at DESC`;
  } else if (HighToLow) {
    query += ` ORDER BY effective_price DESC`;
  } else if (lowToHigh) {
    query += ` ORDER BY effective_price ASC`;
  } else {
    query += ` ORDER BY ${sortBy} ${sortOrder}`;
  }

  // Pagination
  query += ` LIMIT ? OFFSET ?`;
  values.push(Number(limit), Number(offset));

  // Execute the queries
  const [products] = (await pool.query(query, values)) as any[];
  const [totalCountResult] = (await pool.query(
    countQuery,
    values.slice(0, -2),
  )) as any[];
  const totalCount = totalCountResult[0]?.total_count || 0;

  return {
    meta: {
      total: totalCount,
      page,
      limit,
    },
    data: products,
  };
};

// GET ALL
const getAllProducts = async (
  filters: any,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  const { page, limit, offset, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  // Base query to fetch products with category information
  let query = `
    SELECT 
      p.*, 
      COALESCE(p.discount_price, p.regular_price) AS effective_price, 
      JSON_OBJECT(
        'id', c.id,
        'name', c.name,
        'description', c.description,
        'created_at', c.created_at,
        'updated_at', c.updated_at
      ) AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
  `;

  // Construct WHERE conditions for filters
  const filterConditions: string[] = [];
  const filterValues: any[] = [];

  // Dynamically build the filter conditions
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      filterConditions.push(`p.${key} = ?`);
      filterValues.push(value);
    }
  });

  // If there are filters, add them to the query
  if (filterConditions.length > 0) {
    query += ` WHERE ${filterConditions.join(' AND ')}`;
  }

  // Add sorting and pagination to the query
  if (limit && page) {
    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`;
    // Add pagination values to filterValues
    filterValues.push(limit, offset);
  }

  // Execute the query to fetch products
  const [products] = await pool.query(query, filterValues);

  // Query to get the total count of filtered products
  let countQuery = `
    SELECT COUNT(*) AS count 
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
  `;

  // Add the WHERE condition for counting if filters exist
  if (filterConditions.length > 0) {
    countQuery += ` WHERE ${filterConditions.join(' AND ')}`;
  }

  // Execute the count query
  const [totalProductsResult] = (await pool.query(
    countQuery,
    filterValues.slice(0, -2),
  )) as any; // Exclude LIMIT and OFFSET
  const totalProducts = totalProductsResult[0]?.count || 0;

  return {
    meta: {
      total: totalProducts,
      page,
      limit,
    },
    data: products,
  };
};

//   GET SINGLE PRODUCT
const getProductById = async (id: number): Promise<any> => {
  const [product] = (await pool.query(
    `SELECT 
      p.*, 
      JSON_OBJECT(
        'id', c.id,
        'name', c.name,
        'description', c.description
      ) AS category
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.id = ?`,
    [id],
  )) as any[];

  // IF PRODUCT NOT FOUND
  if (product.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product[0];
};

//   GET RANDOM PRODUCT
const getRandomProduct = async (
  filters: any,
  paginationOptions: TPaginationOptions,
): Promise<any> => {
  const { searchKey = '' } = filters;
  const { page = 1, perPage = 8 } = paginationOptions;
  const offset = (Number(page) - 1) * Number(perPage);

  //
  let query = `SELECT * FROM products `;
  const queryParams = [];

  let countQuery = `SELECT COUNT(*) as count FROM products `;
  const countQueryParams = [];

  if (searchKey && searchKey !== 'undefined') {
    query += `WHERE name LIKE ? OR description LIKE ? `;
    countQuery += `WHERE name LIKE ? OR description LIKE ? `;

    queryParams.push(`%${searchKey}%`, `%${searchKey}%`);
    countQueryParams.push(`%${searchKey}%`, `%${searchKey}%`);
  }

  query += `ORDER BY RAND() LIMIT ? OFFSET ?`;
  queryParams.push(Number(perPage), offset);

  // Fetch paginated products
  const [products] = (await pool.query(query, queryParams)) as any[];

  // Fetch total number of products with the same filters applied
  const [totalProductsResult] = (await pool.query(
    countQuery,
    countQueryParams,
  )) as any[];
  const totalProducts = totalProductsResult[0].count;

  return {
    meta: {
      page: Number(page),
      perPage: Number(perPage),
      total: totalProducts,
      totalPage: Math.ceil(totalProducts / Number(perPage)),
    },
    data: products,
  };
};

// UPLOAD PRODUCT IMAGES
const uploadProductImage = async (files: any) => {
  // ARRAY OF FILES
  const uploadableFiles = files?.map((file: any) => file?.file);

  return uploadableFiles;
};

// UPDATE
const updateProduct = async (payload: any) => {
  const {
    id,
    name,
    description,
    regular_price,
    discount_price,
    images,
    category_id,
    quantity,
    is_discount_enable,
    status,
  } = payload;

  const [result] = await pool.query(
    'UPDATE products SET name = ?, description = ?, regular_price = ?, discount_price = ?, images = ?, category_id = ?, quantity = ?, is_discount_enable = ?, status = ? WHERE id = ?',
    [
      name,
      description,
      regular_price,
      discount_price,
      JSON.stringify(images),
      category_id,
      quantity,
      is_discount_enable,
      status,
      id,
    ],
  );

  return result;
};

// DELETE
const deleteProduct = async (id: number): Promise<any> => {
  const result = await pool.query('DELETE FROM products WHERE id = ?', [
    Number(id),
  ]);
  return result;
};

//
export const ProductServices = {
  createProduct,
  getAllClientProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getRandomProduct,
  uploadProductImage,
};
