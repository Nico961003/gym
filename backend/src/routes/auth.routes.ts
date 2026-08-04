import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validation/user.schema.js';

/** Frena los intentos de fuerza bruta contra el login. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Inténtalo de nuevo en unos minutos.' },
});

export const authRouter = Router();

authRouter.post(
  '/register',
  authLimiter,
  validateBody(registerSchema),
  authController.register
);

authRouter.post(
  '/login',
  authLimiter,
  validateBody(loginSchema),
  authController.login
);

authRouter.get('/me', requireAuth, authController.me);
