import { getDatabaseHealth } from './health.service.js';

export async function getHealth(req, res, next) {
  try {
    const health = await getDatabaseHealth();

    res.status(200).json({
      message: 'Database connection is healthy',
      data: health,
    });
  } catch (error) {
    next(error);
  }
}