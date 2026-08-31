import auth from './auth';
import { ENUM_USER_ROLE } from '../../enums/user';

const verifyAdmin = auth(
  ENUM_USER_ROLE.SUPER_ADMIN,
  ENUM_USER_ROLE.ADMIN,
  'super_admin',
  'superAdmin',
  'admin',
);

export default verifyAdmin;
