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
  const {
    page,
    limit: perPage,
    skip,
    sortBy,
    sortOrder,
  } = paginationHelpers.calculatePagination(paginationOptions);
  // Get `page` and `perPage` from query parameters, with defaults
  // let page = parseInt(req.query.page) || 1; // Default to page 1
  // let perPage = parseInt(req.query.perPage) || 20; // Default to 20 per page

  // Calculate offset
  const offset = (page - 1) * perPage;

  // Query to select users with limit and offset for pagination
  const [rows] = await pool.query('SELECT * FROM users LIMIT ? OFFSET ?', [
    perPage,
    offset,
  ]);

  // Query to get the total number of users (for calculating total pages)
  const [countResult] = (await pool.query(
    'SELECT COUNT(*) as totalUsers FROM users',
  )) as any[];
  const totalUsers = countResult[0].totalUsers;
  const totalPages = Math.ceil(totalUsers / perPage);

  // Send paginated result and metadata
  return {
    data: rows,
    currentPage: page,
    perPage: perPage,
    totalPages: totalPages,
    total: totalUsers,
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
