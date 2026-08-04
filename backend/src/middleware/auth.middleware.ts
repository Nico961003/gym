import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type TokenPayload } from '../services/auth.service.js';
import type { UserRow } from '../types/user.js';
import { unauthorized } from '../utils/errors.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
    /** Fila completa del usuario; la rellena `requireRole`. */
    userRow?: UserRow;
  }
}

/** Exige un `Authorization: Bearer <token>` válido. */
export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const header = req.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    next(unauthorized('Falta el token de autenticación'));
    return;
  }

  try {
    req.user = verifyToken(header.slice('Bearer '.length).trim());
    next();
  } catch {
    next(unauthorized('Token inválido o caducado'));
  }
}
