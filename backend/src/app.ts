import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/error.middleware.js';
import { adminRouter } from './routes/admin.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { clienteRouter } from './routes/cliente.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { publicoRouter } from './routes/publico.routes.js';

/**
 * Construye la app de Express. Se separa de `server.ts` para que los tests
 * puedan montarla con supertest sin abrir un puerto.
 */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api/health', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/publico', publicoRouter);
  app.use('/api/cliente', clienteRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
