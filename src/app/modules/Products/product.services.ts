import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';
import { TProduct } from './product.interface';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

// CREATE PRODUCT
const createProduct = async (payload: TProduct): Promise<any> => {
  const {
    name,
    description,
    category_id,
    price,
    discount_type,
    discount_value,
    images,
    quantity,
    unit,
    is_discount_enable,
    status,
  } = payload;

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO products 
      (name, description, category_id, price, discount_type, discount_value, images, quantity, unit, is_discount_enable, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      description,
      category_id,
      price,
      discount_type,
      discount_value,
      JSON.stringify(images),
      quantity,
      unit,
      is_discount_enable,
      status,
    ],
  );

  const newProduct = {
    id: result.insertId,
    name,
    description,
    category_id,
    price,
    discount_type,
    discount_value,
    images,
    quantity,
    unit,
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

  // const offset = (Number(page) - 1) * Number(limit);

  // // Base query for products
  // let query = `
  //   SELECT
  //     p.*,
  //     COALESCE(p.discount_price, p.regular_price) AS effective_price,
  //     JSON_OBJECT(
  //       'id', c.id,
  //       'name', c.name,
  //       'description', c.description,
  //       'created_at', c.created_at,
  //       'updated_at', c.updated_at
  //     ) AS category,
  //     JSON_ARRAYAGG(fp.user_id) AS favorite_users
  //   FROM products p
  //   LEFT JOIN categories c ON c.id = p.category_id
  //   LEFT JOIN favorite_products fp ON p.id = fp.product_id
  // `;

  // // Base query for total count
  // let countQuery = `
  //   SELECT
  //     COUNT(DISTINCT p.id) AS total_count
  //   FROM products p
  //   LEFT JOIN categories c ON c.id = p.category_id
  //   LEFT JOIN favorite_products fp ON p.id = fp.product_id
  // `;

  // // WHERE conditions
  // const whereConditions: string[] = [];
  // const values: any[] = [];

  // if (category_id) {
  //   whereConditions.push('p.category_id = ?');
  //   values.push(category_id);
  // }

  // if (fromPrice) {
  //   whereConditions.push('COALESCE(p.discount_price, p.regular_price) >= ?');
  //   values.push(fromPrice);
  // }

  // if (toPrice) {
  //   whereConditions.push('COALESCE(p.discount_price, p.regular_price) <= ?');
  //   values.push(toPrice);
  // }

  // if (searchTerm) {
  //   whereConditions.push(
  //     `(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`,
  //   );
  //   const term = `%${searchTerm}%`;
  //   values.push(term, term, term);
  // }

  // // Add WHERE clause to both queries if conditions exist
  // if (whereConditions.length > 0) {
  //   const whereClause = ` WHERE ${whereConditions.join(' AND ')}`;
  //   query += whereClause;
  //   countQuery += whereClause;
  // }

  // // GROUP BY for product query
  // query += ` GROUP BY p.id`;

  // // Sorting
  // if (sortByNewest) {
  //   query += ` ORDER BY p.created_at DESC`;
  // } else if (HighToLow) {
  //   query += ` ORDER BY effective_price DESC`;
  // } else if (lowToHigh) {
  //   query += ` ORDER BY effective_price ASC`;
  // } else {
  //   query += ` ORDER BY ${sortBy} ${sortOrder}`;
  // }

  // // Pagination
  // query += ` LIMIT ? OFFSET ?`;
  // values.push(Number(limit), Number(offset));

  // // Execute the queries
  // const [products] = (await pool.query(query, values)) as any[];
  // const [totalCountResult] = (await pool.query(
  //   countQuery,
  //   values.slice(0, -2),
  // )) as any[];
  const query = `
    SELECT p.*,
           JSON_OBJECT(
             'id', c.id,
             'name', c.name,
             'description', c.description
           ) AS category,
           CASE
             WHEN p.discount_type = 'fixed' THEN p.price - p.discount_value
             WHEN p.discount_type = 'percent' THEN p.price - (p.price * p.discount_value / 100)
             ELSE p.price
           END AS net_price
    FROM products p
    JOIN categories c ON p.category_id = c.id;
  `;

  const [products] = await pool.query<RowDataPacket[]>(query);
  const [totalProductsResult] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS count FROM products',
  );

  return {
    meta: {
      total: totalProductsResult[0].count || 0,
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

  // BUILD THE QUERY
  let query = `
    SELECT p.*,
           JSON_OBJECT(
             'id', c.id,
             'name', c.name,
             'description', c.description
           ) AS category,
           CASE
             WHEN p.discount_type = 'fixed' THEN p.price - p.discount_value
             WHEN p.discount_type = 'percent' THEN p.price - (p.price * p.discount_value / 100)
             ELSE p.price
           END AS net_price
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `;

  // Construct WHERE conditions for filters
  const filterConditions: string[] = [];
  const filterValues: any[] = [];

  // DYNAMICALLY BUILD THE FILTER CONDITIONS
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      switch (key) {
        case 'fromPrice':
          // Filter for net_price >= value
          filterConditions.push(`
      (CASE
        WHEN p.discount_type = 'fixed' THEN p.price - p.discount_value
        WHEN p.discount_type = 'percent' THEN p.price - (p.price * p.discount_value / 100)
        ELSE p.price
      END) >= ?`);
          filterValues.push(value);
          break;

        case 'toPrice':
          // Filter for net_price <= value
          filterConditions.push(`
      (CASE
        WHEN p.discount_type = 'fixed' THEN p.price - p.discount_value
        WHEN p.discount_type = 'percent' THEN p.price - (p.price * p.discount_value / 100)
        ELSE p.price
      END) <= ?`);
          filterValues.push(value);
          break;

        case 'searchTerm':
          filterConditions.push(`LOWER(p.name) LIKE LOWER(?)`);
          filterValues.push(`%${value}%`);
          break;

        case 'category_id':
          filterConditions.push(`p.category_id = ?`);
          filterValues.push(value);
          break;

        default:
          filterConditions.push(`p.${key} = ?`);
          filterValues.push(value);
          break;
      }
    }
  });

  // IF THERE ARE FILTERS, ADD THEM TO THE QUERY
  if (filterConditions.length > 0) {
    query += ` WHERE ${filterConditions.join(' AND ')}`;
  }

  // Ensure ORDER BY is always valid
  if (sortBy && sortOrder) {
    query += ` ORDER BY p.${sortBy} ${sortOrder}`;
  } else {
    query += ` ORDER BY p.created_at DESC`; // Default sort column
  }

  // SORTING BY PRICE
  if (filters.lowToHigh) {
    query += ` ORDER BY net_price ASC`;
  } else if (filters.HighToLow) {
    query += ` ORDER BY net_price DESC`;
  }

  // CHECK THE SORTING AND PAGINATION REQUIREMENTS
  if (limit && offset !== undefined) {
    query += ` LIMIT ? OFFSET ?`;
    filterValues.push(limit, offset);
  }

  // EXECUTE THE QUERY TO FETCH PRODUCTS
  const [products] = await pool.query<RowDataPacket[]>(query, filterValues);

  // QUERY TO GET TOTAL COUNT OF FILTERED PRODUCTS
  let countQuery = `
    SELECT COUNT(*) AS count
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
  `;

  // ADD WHERE CONDITION FOR COUNT IF FILTERS EXIST
  if (filterConditions.length > 0) {
    countQuery += ` WHERE ${filterConditions.join(' AND ')}`;
  }

  // Use only the filter values (exclude pagination)
  const countFilterValues = [...filterValues].slice(0, filterConditions.length);

  // EXECUTE THE COUNT QUERY
  const [totalProductsResult] = await pool.query<RowDataPacket[]>(
    countQuery,
    countFilterValues,
  );

  // SEND TO CONTROLLER
  return {
    meta: {
      total: totalProductsResult[0]?.count || 0,
      page,
      limit,
      total_pages: Math.ceil(totalProductsResult[0]?.count / limit! || 0),
    },
    data: products,
  };
};

// GET FILTERED PRODUCTS
const getPriceBounds = async (): Promise<any> => {
  const query = `
    SELECT 
      MAX(CASE
            WHEN p.discount_type = 'fixed' THEN p.price - p.discount_value
            WHEN p.discount_type = 'percent' THEN p.price - (p.price * p.discount_value / 100)
            ELSE p.price
          END) AS max_price,
      MIN(CASE
            WHEN p.discount_type = 'fixed' THEN p.price - p.discount_value
            WHEN p.discount_type = 'percent' THEN p.price - (p.price * p.discount_value / 100)
            ELSE p.price
          END) AS min_price
    FROM products p;
  `;

  const [results] = await pool.query<RowDataPacket[]>(query);

  // SENT TO CONTROLLER
  return {
    meta: {},
    data: {
      max_price: results[0].max_price,
      min_price: results[0].min_price,
    },
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
    price,
    discount_value,
    discount_type, // Added discount type (fixed or percent)
    images,
    category_id,
    quantity,
    unit, // Added unit
    is_discount_enable,
    status,
  } = payload;

  const [result] = await pool.query(
    `UPDATE products 
     SET name = ?, 
         description = ?, 
         price = ?, 
         discount_value = ?, 
         discount_type = ?, 
         images = ?, 
         category_id = ?, 
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
      category_id,
      quantity,
      unit,
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
  getAllProducts,
  getPriceBounds,
  getAllClientProducts,
  updateProduct,
  deleteProduct,
  getProductById,
  getRandomProduct,
  uploadProductImage,
};
