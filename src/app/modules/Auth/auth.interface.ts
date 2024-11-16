import { ENUM_USER_ROLE } from '../../../enums/user';

export type TLoginUser = {
  email?: string;
  password: string;
};

export type TLoginUserResponse = {
  access_token?: string;
  refresh_token?: string;
  is_Password_reset_required?: boolean;
  id?: string;
  role?: string;
  name?: string;
  phone?: string;
  email?: string;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type TRegisterUser = {
  role?: 'user' | 'admin';
  name: string;
  phone?: string;
  email: string;
  password: string;
};

export type TRefreshTokenResponse = {
  access_token: string;
};

export type TVerifiedLoginUser = {
  user_id: string;
  role:
    | ENUM_USER_ROLE.SUPER_ADMIN
    | ENUM_USER_ROLE.ADMIN
    | ENUM_USER_ROLE.DOCTOR
    | ENUM_USER_ROLE.PATIENT;
};
