import { TPaginationOptions } from '../../../interfaces/pagination';
import { TProduct } from './product.interface';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// CREATE PRODUCT
const createProduct = async (payload: TProduct) => {
  const {
    name,
    description,
    regularPrice,
    discountPrice,
    images,
    category,
    inStock,
    createdAt,
    updatedAt,
  } = payload;
  const [result] = (await pool.query(
    'INSERT INTO product (name, description, regularPrice, discountPrice, images, category, inStock, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      name,
      description,
      regularPrice,
      discountPrice,
      JSON.stringify(images),
      category,
      inStock,
      new Date(),
      new Date(),
    ],
  )) as any[];

  const newProduct = {
    id: result.insertId,
    name,
    description,
    regularPrice,
    discountPrice,
    images,
    category,
    inStock,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newProduct;
};

// GET ALL PRODUCT
const getAllClientProducts = async (
  filter: any,
  paginationOptions: TPaginationOptions,
) => {
  const { category, fromPrice, toPrice, sortByNewest } = filter;
  const { page = 1, perPage = 10 } = paginationOptions;

  const offset = (page - 1) * perPage;

  // Base query for products
  let query =
    'SELECT *, COALESCE(discountPrice, regularPrice) AS effectivePrice FROM product';
  const params: (string | number)[] = [];

  // Conditions for filtering
  const conditions: string[] = [];
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (fromPrice) {
    conditions.push('COALESCE(discountPrice, regularPrice) >= ?');
    params.push(parseFloat(fromPrice));
  }

  if (toPrice) {
    conditions.push('COALESCE(discountPrice, regularPrice) <= ?');
    params.push(parseFloat(toPrice));
  }

  // Append conditions to the query
  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  // Sort products
  if (sortByNewest) {
    query += ' ORDER BY createdAt DESC';
  } else if (sortBy) {
    query += ` ORDER BY ${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  }

  // Add pagination to the query
  query += ' LIMIT ? OFFSET ?';
  params.push(perPage, offset);

  // Execute query to get paginated products
  const [products] = (await pool.query(query, params)) as any[];

  // Count query to get total product count with the same conditions
  let countQuery = 'SELECT COUNT(*) as count FROM product';
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }

  // Execute count query (exclude LIMIT and OFFSET params)
  const [totalProductsResult] = (await pool.query(
    countQuery,
    params.slice(0, -2),
  )) as any[];
  const totalProducts = totalProductsResult[0].count;

  // Parse products and send the response
  return {
    data: products.map((product: any) => {
      let images;
      try {
        images = JSON.parse(product.images);
      } catch (error) {
        console.error(
          'JSON parsing error for product images:',
          product.images,
          error,
        );
        images = product.images; // Use the original string if parsing fails
      }
      return {
        ...product,
        images,
      };
    }),
    total: totalProducts,
    page,
    perPage,
    totalPages: Math.ceil(totalProducts / perPage),
  };
};

// GET ALL
const getAllProducts = async () => {
  // Get all products (name and id only)
  const [products] = await pool.query('SELECT id, name FROM product');

  // Get total count of products
  const [totalProductsResult] = (await pool.query(
    'SELECT COUNT(*) as count FROM product',
  )) as any[];
  const totalProducts = totalProductsResult[0].count;

  return {
    data: products, // Only id and name are returned
    total: totalProducts,
  };
};

//   GET SINGLE PRODUCT
const getProductById = async (id: any) => {
  const [product] = (await pool.query('SELECT * FROM product WHERE id = ?', [
    parseInt(id),
  ])) as any[];

  // console.log({ singlePro: product });

  if (product.length === 0) {
    return { error: 'Product not found' };
  }
  const [category] = (await pool.query('SELECT * FROM category WHERE id = ?', [
    product[0].category,
  ])) as any[];
  return {
    success: true,
    data: product?.map((product: any) => {
      try {
        const parsedImages = JSON.parse(product.images);
        return {
          ...product,
          categoryName: category[0].name,
          images: parsedImages,
        };
      } catch (error) {
        console.error(
          'JSON parsing error for product images:',
          product.images,
          error,
        );
        return {
          ...product,
          images: product.images, // Return the original string if parsing fails
        };
      }
    })[0],
  };
};

//   GET PRODUCT BY CATEGORY
const getProductByCategoryID = async (id: any, reqQuery: any) => {
  const { limit = 4, skip } = reqQuery;

  const query = skip
    ? 'SELECT * FROM product WHERE category = ? AND id != ? LIMIT ?'
    : 'SELECT * FROM product WHERE category = ? LIMIT ?';

  const values = skip
    ? [id, parseInt(skip), parseInt(limit)]
    : [id, parseInt(limit)];

  const [products] = (await pool.query(query, values)) as any[];

  return {
    success: true,
    data: products?.map((product: any) => {
      try {
        const parsedImages = JSON.parse(product.images);
        return {
          ...product,
          images: parsedImages,
        };
      } catch (error) {
        console.error(
          'JSON parsing error for product images:',
          product.images,
          error,
        );
        return {
          ...product,
          images: product.images, // Return the original string if parsing fails
        };
      }
    }),
  };
};

//   GET RANDOM PRODUCT
const getRandomProduct = async (
  filters: any,
  paginationOptions: TPaginationOptions,
) => {
  const { searchKey = '' } = filters;
  const { page = 1, perPage = 8 } = paginationOptions;
  const offset = (page - 1) * perPage;
  let query = `SELECT * FROM product `;
  const queryParams = [];

  let countQuery = `SELECT COUNT(*) as count FROM product `;
  const countQueryParams = [];

  if (searchKey && searchKey !== 'undefined') {
    query += `WHERE name LIKE ? OR description LIKE ? `;
    countQuery += `WHERE name LIKE ? OR description LIKE ? `;

    queryParams.push(`%${searchKey}%`, `%${searchKey}%`);
    countQueryParams.push(`%${searchKey}%`, `%${searchKey}%`);
  }

  query += `ORDER BY RAND() LIMIT ? OFFSET ?`;
  queryParams.push(parseInt(perPage), offset);

  // Fetch paginated products
  const [products] = (await pool.query(query, queryParams)) as any[];

  // Fetch total number of products with the same filters applied
  const [totalProductsResult] = (await pool.query(
    countQuery,
    countQueryParams,
  )) as any[];
  const totalProducts = totalProductsResult[0].count;

  // Process and send response
  return {
    success: true,
    data: products?.map((product: any) => {
      try {
        const parsedImages = JSON.parse(product.images);
        return {
          ...product,
          images: parsedImages,
        };
      } catch (error) {
        console.error(
          'JSON parsing error for product images:',
          product.images,
          error,
        );
        return {
          ...product,
          images: product.images, // Return the original string if parsing fails
        };
      }
    }),
    page: parseInt(page),
    perPage: parseInt(perPage),
    total: totalProducts,
  };
};

//  GET PRODUCT BY PRICE RANGE
const getProductByPriceRange = async () => {
  // Get the most expensive product
  const [mostExpensiveProduct] = (await pool.query(
    'SELECT * FROM product ORDER BY regularPrice DESC LIMIT 1',
  )) as any[];

  // Get the cheapest product
  const [cheapestProduct] = (await pool.query(
    'SELECT * FROM product ORDER BY regularPrice ASC LIMIT 1',
  )) as any[];

  return {
    mostExpensiveProduct: mostExpensiveProduct[0],
    cheapestProduct: cheapestProduct[0],
  };
};

// UPLOAD PRODUCT IMAGES
const uploadProductImage = async (files: any) => {
  const docs = files?.map((file: any) => ({
    file: file?.filename,
    id: file?.originalname,
  }));
  return docs;
};

// UPDATE
const updateProduct = async (payload: any) => {
  const {
    id,
    name,
    description,
    regularPrice,
    discountPrice,
    images,
    category,
    inStock,
    createdAt,
  } = payload;

  const [result] = await pool.query(
    'UPDATE product SET name = ?, description = ?, regularPrice = ?, discountPrice = ?, images = ?, category = ?, inStock = ?, createdAt = ?, updatedAt = ? WHERE id = ?',
    [
      name,
      description,
      regularPrice,
      discountPrice,
      JSON.stringify(images),
      category,
      inStock,
      createdAt,
      new Date(),
      id,
    ],
  );

  return result;
};

// DELETE
const deleteProduct = async (id: any) => {
  const result = await pool.query('DELETE FROM product WHERE id = ?', [
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
  getProductByCategoryID,
  getRandomProduct,
  getProductByPriceRange,
  uploadProductImage,
};
