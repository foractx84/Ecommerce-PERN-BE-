import { checkDatabaseConnection } from '../../config/db.js';

export async function getDatabaseHealth() {
  const dbResult = await checkDatabaseConnection();

  return {
    status: 'ok',
    database: 'connected',
    currentTime: dbResult.current_time,
  };
}