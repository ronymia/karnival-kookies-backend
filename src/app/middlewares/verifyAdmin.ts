import { NextFunction, Request, Response } from 'express';
import { mysqlcreateConnection as pool } from '../../config';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';

const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req?.user?.email;
    // Query to check if the user is an admin
    const [rows] = (await pool.query('SELECT role FROM users WHERE email = ?', [
      email,
    ])) as any[];

    if (rows.length === 0 || rows[0].role !== 'admin') {
      throw new AppError(httpStatus.FORBIDDEN, 'You have no access');
    }

    //
    next(); // User is an admin, proceed to the next middleware
  } catch (error) {
    next(error);
  }
};

export default verifyAdmin;
