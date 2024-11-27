import httpStatus from 'http-status';
import AppError from '../../../errors/AppError';
import { pool } from '../../../shared/mySQL';
import { TPaginationOptions } from '../../../interfaces/pagination';
import { paginationHelpers } from '../../../helpers/paginationHelpers';

// GET ALL USERS
const getAllUsers = async (
  filters: any,
  paginationOptions: TPaginationOptions,
) => {
  const { page, limit, offset } =
    paginationHelpers.calculatePagination(paginationOptions);

  // Query to select users with limit and offset for pagination
  const [rows] = await pool.query('SELECT * FROM users LIMIT ? OFFSET ?', [
    Number(limit),
    offset,
  ]);

  // Query to get the total number of users (for calculating total pages)
  const [countResult] = (await pool.query(
    'SELECT COUNT(*) as totalUsers FROM users',
  )) as any[];

  // GET TOTAL USER COUNT
  const totalUsers = countResult[0].totalUsers;

  // CALCULATE TOTAL USER
  const totalPages = Math.ceil(totalUsers / Number(limit));

  // Send paginated result and meta data
  return {
    meta: {
      page: Number(page),
      perPage: Number(limit),
      total: totalUsers,
      totalPage: totalPages,
    },
    data: rows,
  };
};
// UPDATE
const updateUser = async (payload: any, email: string) => {
  //   Check if the user exists
  const [rows] = (await pool.query('SELECT * FROM users WHERE email = ?', [
    email,
  ])) as any[];

  const user = rows[0];

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not Found');
  }

  const [updatedUser] = await pool.query('UPDATE users SET ? WHERE email = ?', [
    payload,
    email,
  ]);

  return updatedUser;
};

export const UserServices = { updateUser, getAllUsers };
