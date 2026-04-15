import bcrypt from 'bcrypt';
import crypto from 'crypto';
import ApiError from '../../utils/ApiError.js';
import { withTransaction } from '../../config/db.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../../utils/jwt.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
  createRefreshToken,
  findValidRefreshTokenByHash,
  revokeRefreshTokenByHash,
} from './auth.repository.js';

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getRefreshExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  return expiresAt;
}

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

export async function loginUser({ email, password }) {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.is_active) {
    throw new ApiError(403, 'User account is inactive');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  await createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: getRefreshExpiryDate(),
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    },
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!user.is_active) {
    throw new ApiError(403, 'User account is inactive');
  }

  return user;
}

export async function refreshUserSession(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is required');
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const tokenHash = hashToken(refreshToken);

  return withTransaction(async (client) => {
    const savedToken = await findValidRefreshTokenByHash(tokenHash, client);

    if (!savedToken) {
      throw new ApiError(401, 'Refresh token is not recognized');
    }

    const user = await findUserById(decoded.sub, client);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.is_active) {
      throw new ApiError(403, 'User account is inactive');
    }

    await revokeRefreshTokenByHash(tokenHash, client);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await createRefreshToken(
      {
        userId: user.id,
        tokenHash: hashToken(newRefreshToken),
        expiresAt: getRefreshExpiryDate(),
      },
      client
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user,
    };
  });
}

export async function logoutUser(refreshToken) {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashToken(refreshToken);
  await revokeRefreshTokenByHash(tokenHash);
}