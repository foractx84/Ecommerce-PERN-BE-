import ApiError from '../../utils/ApiError.js';
import { verifyAccessToken } from '../../utils/jwt.js';

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(401, 'Authorization header is required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization header must use Bearer token');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'Access token is required');
    }

    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token'));
    }

    next(error);
  }
}