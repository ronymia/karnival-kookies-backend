import bcrypt from 'bcrypt';
import config from '../config';

const passwordHash = async (password: any) => {
  // CONVERT TO HASH PASSWORD
  const passwordHash = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  return passwordHash;
};

const passwordMatch = async (password: any, password_hash: string) => {
  return await bcrypt.compare(password, password_hash);
};

export const PasswordHelpers = {
  passwordHash,
  passwordMatch,
};
