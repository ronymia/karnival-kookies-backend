import { TPaginationOptions } from '../../../interfaces/pagination';
import { pool } from '../../../shared/mySQL';
import { TProduct } from './product.interface';

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
  const { page = 1, perPage = 10, sortBy, sortOrder } = paginationOptions;

  const offset = (Number(page) - 1) * Number(perPage);

  // Helper: Build filter conditions
  const buildConditions = () => {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

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

    return { conditions, params };
  };

  // Helper: Build ORDER BY clause
  const buildSorting = () => {
    if (sortByNewest) {
      return 'createdAt DESC';
    } else if (sortBy) {
      return `${sortBy} ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
    } else if (sortOrder === 'highToLow') {
      return 'COALESCE(discountPrice, regularPrice) DESC';
    } else if (sortOrder === 'lowToHigh') {
      return 'COALESCE(discountPrice, regularPrice) ASC';
    }
    return 'createdAt ASC'; // Default sorting
  };

  // Build query
  const { conditions, params } = buildConditions();
  let query =
    'SELECT p.*, COALESCE(discountPrice, regularPrice) AS effectivePrice, GROUP_CONCAT(fp.user_id) AS favorite_users FROM product p';

  // Join favorite_products table to fetch the user_ids who favorited the product
  query += ' LEFT JOIN favorite_products fp ON p.id = fp.product_id';

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  const orderBy = buildSorting();
  query += ` GROUP BY p.id ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
  params.push(Number(perPage), offset);

  // Execute main query
  const [products] = (await pool.query(query, params)) as any[];

  // Build and execute count query
  let countQuery = 'SELECT COUNT(*) as count FROM product';
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }
  const [totalProductsResult] = (await pool.query(
    countQuery,
    params.slice(0, -2), // Exclude pagination params
  )) as any[];
  const totalProducts = totalProductsResult[0].count;

  // Parse product images
  const parseProductImages = products.map((product: any) => {
    let images;
    try {
      images = JSON.parse(product.images);
    } catch (error) {
      console.error(
        'JSON parsing error for product images:',
        product.images,
        error,
      );
      images = product.images; // Fallback to original string
    }

    // Convert favorite_users to an array of user IDs
    const favoriteUsers = product.favorite_users
      ? product.favorite_users.split(',').map(Number)
      : [];

    return {
      ...product,
      images,
      favorite_users: favoriteUsers, // Add the favorite_users field
    };
  });

  // Return paginated response
  return {
    meta: {
      page,
      perPage,
      total: totalProducts,
      totalPage: Math.ceil(totalProducts / Number(perPage)),
    },
    data: parseProductImages,
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
  const offset = (Number(page) - 1) * Number(perPage);
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
  queryParams.push(Number(perPage), offset);

  // Fetch paginated products
  const [products] = (await pool.query(query, queryParams)) as any[];

  // Fetch total number of products with the same filters applied
  const [totalProductsResult] = (await pool.query(
    countQuery,
    countQueryParams,
  )) as any[];
  const totalProducts = totalProductsResult[0].count;

  // PARSE PRODUCT IMAGES JSON TO JS
  const parseProductImages = products?.map((product: any) => {
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
  });

  // Process and send response
  // return {

  //   success: true,
  //   data: productImages,
  //   page: Number(page),
  //   perPage: Number(perPage),
  //   total: totalProducts,
  // };
  return {
    meta: {
      page: Number(page),
      perPage: Number(perPage),
      total: totalProducts,
      totalPage: Math.ceil(totalProducts / Number(perPage)),
    },
    data: parseProductImages,
  };
};

//  GET PRODUCT BY PRICE RANGE
const getProductByPriceRange = async () => {
  try {
    // Get the most expensive product
    const [mostExpensiveProduct] = (await pool.query(
      'SELECT * FROM product ORDER BY regularPrice DESC LIMIT 1',
    )) as any[];

    // Get the cheapest product
    const [cheapestProduct] = (await pool.query(
      'SELECT * FROM product ORDER BY regularPrice ASC LIMIT 1',
    )) as any[];

    if (!mostExpensiveProduct[0] || !cheapestProduct[0]) {
      throw new Error('No products found in the database.');
    }

    return {
      mostExpensiveProduct: mostExpensiveProduct[0],
      cheapestProduct: cheapestProduct[0],
    };
  } catch (error) {
    console.error('Error fetching product price range:', error);
    throw error; // Re-throw to handle it higher up
  }
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
    regularPrice,
    discountPrice,
    images,
    category,
    inStock,
  } = payload;

  const [result] = await pool.query(
    'UPDATE product SET name = ?, description = ?, regularPrice = ?, discountPrice = ?, images = ?, category = ?, inStock = ?, updatedAt = ? WHERE id = ?',
    [
      name,
      description,
      regularPrice,
      discountPrice,
      JSON.stringify(images),
      category,
      inStock,
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
