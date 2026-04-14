import { registerSchema, loginSchema } from './auth.validation.js';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshUserSession,
  logoutUser,
} from './auth.service.js';
import ApiError from '../../utils/ApiError.js';
import { getRefreshTokenCookieOptions } from './auth.utils.js';

export async function register(req, res, next) {
  try {
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
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
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
  } catch (error) {
    next(error);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);

    res.status(200).json({
      message: 'Authenticated user retrieved successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function refresh(req, res, next) {
  try {
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
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const refreshToken = req.cookies.refreshToken;

    await logoutUser(refreshToken);

    res
      .clearCookie('refreshToken', getRefreshTokenCookieOptions())
      .status(200)
      .json({
        message: 'Logout successful',
      });
  } catch (error) {
    next(error);
  }
}