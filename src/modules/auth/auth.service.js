import bcrypt from 'bcrypt';
import ApiError from '../../utils/ApiError.js';
import { findUserByEmail, createUser } from './auth.repository.js';

export async function registerUser({ name, email, password }) {
  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    passwordHash,
  });

  return user;
}