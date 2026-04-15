import { registerSchema, loginSchema } from './auth.validation.js';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshUserSession,
  logoutUser,
} from './auth.service.js';
import ApiError from '../../utils/ApiError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { getRefreshTokenCookieOptions } from './auth.utils.js';

export const register = asyncHandler(async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ApiError(400, firstIssue.message);
  }

  const user = await registerUser(parsed.data);

  res.status(201).json({
    message: 'User registered successfully',
    data: user,
  });
});

export const login = asyncHandler(async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    throw new ApiError(400, firstIssue.message);
  }

  const result = await loginUser(parsed.data);

  res
    .cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions())
    .status(200)
    .json({
      message: 'Login successful',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.user.id);

  res.status(200).json({
    message: 'Authenticated user retrieved successfully',
    data: user,
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  const result = await refreshUserSession(refreshToken);

  res
    .cookie('refreshToken', result.refreshToken, getRefreshTokenCookieOptions())
    .status(200)
    .json({
      message: 'Token refreshed successfully',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  await logoutUser(refreshToken);

  res
    .clearCookie('refreshToken', getRefreshTokenCookieOptions())
    .status(200)
    .json({
      message: 'Logout successful',
    });
});