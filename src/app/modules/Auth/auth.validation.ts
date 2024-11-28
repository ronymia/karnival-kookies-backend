import { z } from 'zod';
import { userRole } from '../../../constants/user';

// LOGIN SCHEMA
const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Please Provide Valid Email Address' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

// REGISTER SCHEMA
const registerZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Please Provide Valid Email Address' }),
    password: z.string({ required_error: 'Password is required' }),
    role: z.enum([...userRole] as [string, ...string[]]),
  }),
});

// REFRESH TOKEN SCHEMA
const refreshTokenZodSchema = z.object({
  cookie: z.object({
    refreshTokenZodSchema: z.string({
      required_error: 'Refresh Token is required',
    }),
  }),
});

// CHANGE PASSWORD SCHEMA
const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password  is required',
    }),
    newPassword: z.string({
      required_error: 'New password  is required',
    }),
  }),
});

export const AuthValidations = {
  registerZodSchema,
  loginZodSchema,
  refreshTokenZodSchema,
  changePasswordZodSchema,
};
