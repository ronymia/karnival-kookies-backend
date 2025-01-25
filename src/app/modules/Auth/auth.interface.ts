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

export interface IRegisterUser {
  id: number;
  email: string;
  password: string;
  role: string;
  is_email_verified: boolean;
}

export type TRefreshTokenResponse = {
  access_token: string;
};

export type TVerifiedLoginUser = {
  user_id: string;
  role:
    | ENUM_USER_ROLE.SUPER_ADMIN
    | ENUM_USER_ROLE.ADMIN
    | ENUM_USER_ROLE.MANAGER
    | ENUM_USER_ROLE.CONTENT_EDITOR
    | ENUM_USER_ROLE.ANALYST
    | ENUM_USER_ROLE.CUSTOMER;
};
