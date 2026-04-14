import { Router } from 'express';
import { register } from './auth.controller.js';

const router = Router();

router.post('/register', register);

router.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Auth route is working',
  });
});

export default router;