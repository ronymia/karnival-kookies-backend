import { z } from 'zod';

const loginZodSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Please Provide Valid Email Address' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});
const registerZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z
      .string({ required_error: 'Email is required' })
      .email({ message: 'Please Provide Valid Email Address' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});
const refreshTokenZodSchema = z.object({
  cookie: z.object({
    refreshTokenZodSchema: z.string({
      required_error: 'Refresh Token is required',
    }),
  }),
});

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
