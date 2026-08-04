import { Router } from 'express';
import { checkDatabaseConnection } from '../db/pool.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const dbOk = await checkDatabaseConnection();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? 'ok' : 'degradado',
    database: dbOk ? 'conectada' : 'sin conexión',
    timestamp: new Date().toISOString(),
  });
});
