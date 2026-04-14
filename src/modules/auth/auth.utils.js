import env from '../../config/env.js';

export function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'strict',
    path: '/api/auth',
  };
}