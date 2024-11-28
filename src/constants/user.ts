import { ENUM_USER_ROLE, GENDER } from '../enums/user';
import { TBloodGroup, TGender } from '../interfaces/user';

export const gender: TGender[] = [GENDER.MALE, GENDER.FEMALE];
export const blood_group: TBloodGroup[] = [
  'A+',
  'A-',
  'B+',
  'B-',
  'AB+',
  'AB-',
  'O+',
  'O-',
];

export const userRole: string[] = [
  ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.ADMIN,
  ENUM_USER_ROLE.MANAGER,
  ENUM_USER_ROLE.CONTENT_EDITOR,
  ENUM_USER_ROLE.ANALYST,
  ENUM_USER_ROLE.CUSTOMER,
];
