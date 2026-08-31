import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { mysqlcreateConnection as pool } from '../../../config';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import moment from 'moment';
import { PasswordHelpers } from '../../../helpers/passwordHelpers';

// CREATE USER
const createUser = async (payload: any) => {
  const {
    name,
    email,
    password,
    role = 'customer',
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

  // HASH PASSWORD IF NOT ALREADY HASHED
  let hashedPassword = password;
  if (password && !password.startsWith('$2b$') && !password.startsWith('$2a$')) {
    hashedPassword = await PasswordHelpers.passwordHash(password);
  }

  // SAFE DATE OF BIRTH
  const formattedDob =
    date_of_birth && typeof date_of_birth === 'string' && date_of_birth.trim() !== ''
      ? moment(date_of_birth, ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601]).isValid()
        ? moment(date_of_birth, ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601]).format('YYYY-MM-DD')
        : '1990-01-01'
      : '1990-01-01';

  const userGender = gender || 'other';

  const connection = await pool.getConnection();
  try {
    // START TRANSACTION
    await connection.beginTransaction();

    // CREATE USER ON DATABASE
    const [createdUser] = await connection.query<ResultSetHeader>(
      'INSERT INTO users (email, password, role, is_email_verified) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, role, true],
    );

    if (!createdUser.insertId) {
      await connection.rollback();
      throw new AppError(httpStatus.BAD_REQUEST, 'User Not Created');
    }

    // CREATE USER PROFILE ON DATABASE
    const [result] = await connection.query<ResultSetHeader>(
      'INSERT INTO profiles (user_id, name, phone, address, country, city, postcode, date_of_birth, gender) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        createdUser.insertId,
        name || '',
        phone || null,
        address || null,
        country || null,
        city || null,
        postcode || null,
        formattedDob,
        userGender,
      ],
    );

    if (!result.insertId) {
      await connection.rollback();
      throw new AppError(httpStatus.BAD_REQUEST, 'Profile Not Created');
    }

    // COMMIT TRANSACTION
    await connection.commit();

    // RETURN CREATED USER
    return {
      id: createdUser.insertId,
      name,
      email,
      role,
      phone,
      address,
      country,
      city,
      postcode,
      date_of_birth: formattedDob,
      gender: userGender,
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
        date_of_birth: item.profile?.date_of_birth
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
    status,
  } = payload;

  const connection = await pool.getConnection();
  try {
    // START TRANSACTION
    await connection.beginTransaction();

    // CHECK IF USER EXISTS AND FETCH EXISTING PROFILE
    const [userRows] = await connection.query<RowDataPacket[]>(
      `SELECT u.*, p.id as profile_id, p.name as profile_name, p.phone as profile_phone, 
              p.address as profile_address, p.country as profile_country, p.city as profile_city, 
              p.postcode as profile_postcode, p.date_of_birth as profile_dob, p.gender as profile_gender 
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = ?`,
      [userId],
    );

    if (userRows.length === 0) {
      throw new AppError(httpStatus.NOT_FOUND, 'User Not Found');
    }

    const existing = userRows[0];

    // CHECK IF EMAIL IS TAKEN (EXCLUDING CURRENT USER)
    if (email && email !== existing.email) {
      const [emailRows] = await connection.query<RowDataPacket[]>(
        'SELECT * FROM users WHERE email = ? AND id != ?',
        [email, userId],
      );
      if (emailRows.length > 0) {
        throw new AppError(httpStatus.CONFLICT, 'Email Already Taken');
      }
    }

    // PREPARE UPDATED USER FIELDS
    const updatedEmail = email || existing.email;
    const updatedRole = role || existing.role;
    const updatedStatus = status || existing.status;

    let updatedPassword = existing.password;
    if (password && typeof password === 'string' && password.trim() !== '') {
      updatedPassword = await PasswordHelpers.passwordHash(password);
    }

    // UPDATE USERS TABLE
    await connection.query(
      `UPDATE users 
       SET email = ?, 
           password = ?, 
           role = ?,
           status = ?
       WHERE id = ?`,
      [updatedEmail, updatedPassword, updatedRole, updatedStatus, userId],
    );

    // PREPARE UPDATED PROFILE FIELDS
    const updatedName = name !== undefined && name !== null ? name : (existing.profile_name || '');
    const updatedPhone = phone !== undefined ? (phone || null) : existing.profile_phone;
    const updatedAddress = address !== undefined ? (address || null) : existing.profile_address;
    const updatedCountry = country !== undefined ? (country || null) : existing.profile_country;
    const updatedCity = city !== undefined ? (city || null) : existing.profile_city;
    const updatedPostcode = postcode !== undefined ? (postcode || null) : existing.profile_postcode;
    const updatedGender = gender ? gender : (existing.profile_gender || 'other');

    // SAFE DATE OF BIRTH
    let formattedDob = existing.profile_dob
      ? moment(existing.profile_dob).format('YYYY-MM-DD')
      : '1990-01-01';

    if (date_of_birth && typeof date_of_birth === 'string' && date_of_birth.trim() !== '') {
      if (moment(date_of_birth, ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601]).isValid()) {
        formattedDob = moment(date_of_birth, ['YYYY-MM-DD', 'DD-MM-YYYY', moment.ISO_8601]).format('YYYY-MM-DD');
      }
    }

    // UPSERT PROFILES TABLE
    if (existing.profile_id) {
      await connection.query(
        `UPDATE profiles 
         SET name = ?, 
             phone = ?, 
             address = ?, 
             country = ?, 
             city = ?, 
             postcode = ?, 
             date_of_birth = ?, 
             gender = ?
         WHERE user_id = ?`,
        [
          updatedName,
          updatedPhone,
          updatedAddress,
          updatedCountry,
          updatedCity,
          updatedPostcode,
          formattedDob,
          updatedGender,
          userId,
        ],
      );
    } else {
      await connection.query(
        `INSERT INTO profiles 
         (user_id, name, phone, address, country, city, postcode, date_of_birth, gender)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          updatedName,
          updatedPhone,
          updatedAddress,
          updatedCountry,
          updatedCity,
          updatedPostcode,
          formattedDob,
          updatedGender,
        ],
      );
    }

    // COMMIT TRANSACTION
    await connection.commit();

    // RETURN UPDATED USER
    return {
      id: userId,
      name: updatedName,
      email: updatedEmail,
      role: updatedRole,
      status: updatedStatus,
      phone: updatedPhone,
      address: updatedAddress,
      country: updatedCountry,
      city: updatedCity,
      postcode: updatedPostcode,
      date_of_birth: formattedDob,
      gender: updatedGender,
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
