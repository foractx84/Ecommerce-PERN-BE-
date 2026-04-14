import { Router } from 'express';
import { getHealth } from './health.controller.js';

const router = Router();

router.get('/db', getHealth);

export default router;