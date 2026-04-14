import { Router } from 'express';
import {
  register,
  login,
  getMe,
  refresh,
  logout,
} from './auth.controller.js';
import { requireAuth } from './auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Auth route is working',
  });
});

export default router;