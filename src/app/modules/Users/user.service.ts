import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import moment from 'moment';

// CREATE USER
const createUser = async (payload: any) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    address,
    country,
    city,
    postcode,
    date_of_birth,
    gender,
  } = payload;

  // CHECK IF USER ALREADY EXIST
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT * FROM users WHERE email = ?',
    [email],
  );
  // USER ALREADY EXIST
  if (rows.length > 0) {
    throw new AppError(httpStatus.CONFLICT, 'Email Already Taken');
  }

  const connection = await pool.getConnection();
  try {
    // START TRANSACTION
    await connection.beginTransaction();
    // CREATE USER ON DATABASE
    const [createdUser] = await connection.query<ResultSetHeader>(
      'INSERT INTO users ( email, password, role, is_email_verified) VALUES (?, ?, ?, ?)',
      [email, password, role, true],
    );

    if (!createdUser.insertId) {
      // ROLLBACK TRANSACTION
      await connection.rollback();
      throw new AppError(httpStatus.BAD_REQUEST, 'User Not Created');
    } else if (createdUser.insertId) {
      // CREATE USER PROFILE ON DATABASE
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO profiles (user_id, name,  phone, address, country, city, postcode, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          createdUser.insertId,
          name,
          phone,
          address,
          country,
          city,
          postcode,
          moment(date_of_birth, 'DD-MM-YYYY').format('YYYY-MM-DD'),
          gender,
        ],
      );
      // USER NOT CREATED
      if (!result.insertId) {
        // ROLLBACK TRANSACTION
        await connection.rollback();
        throw new AppError(httpStatus.BAD_REQUEST, 'User Not Created');
      }
    }

    // COMMIT TRANSACTION
    await connection.commit();

    // RETURN CREATED USER
    return {
      id: createdUser.insertId,
      name,
      email,
      password,
      role,
      phone,
      address,
      country,
      city,
      postcode,
      date_of_birth,
      gender,
    };
  } catch (error) {
    // ROLLBACK TRANSACTION
    await connection.rollback();
    throw error;
  } finally {
    // RELEASE CONNECTION
    connection.release();
  }
};

// GET ALL USERS
const getAllUsers = async (
  filters: any,
  paginationOptions: TPaginationOptions,
) => {
  // DESTRUCTURE
  const { page, limit, offset, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  let query = `
              SELECT u.*, 
                JSON_OBJECT(
                  "id", p.id,
                  "name", p.name,
                  "phone", p.phone,
                  "address", p.address,
                  "country", p.country,
                  "city", p.city,
                  "postcode", p.postcode,
                  "date_of_birth", p.date_of_birth,
                  "gender", p.gender
                ) AS profile
              FROM users u 
              LEFT JOIN profiles p ON u.id = p.user_id
            `;

  // QUERY PARAMS
  const queryParams = [];

  // SORT BY AND SORT ORDER REQUIREMENT
  if (sortBy) {
    query += ` ORDER BY u.${sortBy} ${sortOrder}`;
  }

  // CHECKING PAGINATION REQUIREMENT
  if (page && limit) {
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(Number(limit), offset);
  }
  // EXECUTE THE QUERY
  const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);

  // GET TOTAL USER COUNT
  const [countResult] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) as count FROM users',
  );

  // Send paginated result and meta data
  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total: countResult[0]?.count,
      total_page: Math.ceil(countResult[0]?.count / Number(limit)),
      sortBy,
      sortOrder,
    },
    data: rows?.map((item) => ({
      ...item,
      profile: {
        ...item.profile,
        date_of_birth: item.profile.date_of_birth
          ? moment(item.profile.date_of_birth, 'YYYY-MM-DD').format(
              'DD-MM-YYYY',
            )
          : null,
      },
    })),
  };
};

// UPDATE USER
const updateUser = async (payload: any, userId: number) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    address,
    country,
    city,
    postcode,
    date_of_birth,
    gender,
  } = payload;

  const connection = await pool.getConnection();
  try {
    // START TRANSACTION
    await connection.beginTransaction();

    // CHECK IF USER EXISTS
    const [userRows] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM users WHERE id = ?',
      [userId],
    );

    if (userRows.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'User Not Found');
    }

    // CHECK IF EMAIL IS TAKEN (EXCLUDING CURRENT USER)
    if (email) {
      const [emailRows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ? AND id != ?',
        [email, userId],
      );
      if (emailRows.length > 0) {
        throw new AppError(httpStatus.CONFLICT, 'Email Already Taken');
      }
    }

    // UPDATE USERS TABLE
    const userUpdateQuery = `
      UPDATE users 
      SET email = ?, 
          password = ?, 
          role = ?
      WHERE id = ?
    `;
    await connection.query(userUpdateQuery, [email, password, role, userId]);

    // UPDATE PROFILES TABLE
    const profileUpdateQuery = `
      UPDATE profiles 
      SET name = ?, 
          phone = ?, 
          address = ?, 
          country = ?, 
          city = ?, 
          postcode = ?, 
          date_of_birth = ?, 
          gender = ?
      WHERE user_id = ?
    `;
    await connection.query(profileUpdateQuery, [
      name,
      phone,
      address,
      country,
      city,
      postcode,
      moment(date_of_birth, 'DD-MM-YYYY').format('YYYY-MM-DD'),
      gender,
      userId,
    ]);

    // COMMIT TRANSACTION
    await connection.commit();

    // RETURN UPDATED USER
    return {
      id: userId,
      name,
      email,
      role,
      phone,
      address,
      country,
      city,
      postcode,
      date_of_birth,
      gender,
    };
  } catch (error) {
    // ROLLBACK TRANSACTION
    await connection.rollback();
    throw error;
  } finally {
    // RELEASE CONNECTION
    connection.release();
  }
};

export const UserServices = { createUser, updateUser, getAllUsers };
