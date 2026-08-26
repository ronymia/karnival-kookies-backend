import { z } from 'zod';
import { userRole } from '../../../constants/user';

// LOGIN SCHEMA
const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email({ message: 'Please Provide Valid Email Address' }),
    password: z.string({ message: 'Password is required' }),
  }),
});

// REGISTER SCHEMA
const registerZodSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .email({ message: 'Please Provide Valid Email Address' }),
    password: z.string({ message: 'Password is required' }),
    role: z.enum([...userRole] as [string, ...string[]]),
  }),
});

// REFRESH TOKEN SCHEMA
const refreshTokenZodSchema = z.object({
  cookie: z.object({
    refreshTokenZodSchema: z.string({
      message: 'Refresh Token is required',
    }),
  }),
});

// CHANGE PASSWORD SCHEMA
const changePasswordZodSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      message: 'Old password  is required',
    }),
    newPassword: z.string({
      message: 'New password  is required',
    }),
  }),
});

export const AuthValidations = {
  registerZodSchema,
  loginZodSchema,
  refreshTokenZodSchema,
  changePasswordZodSchema,
};
