import type { NextFunction, Request, Response } from 'express';
import * as audit from '../services/audit.service.js';
import * as authService from '../services/auth.service.js';
import { unauthorized } from '../utils/errors.js';
import type { LoginInput, RegisterInput } from '../validation/user.schema.js';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.register(req.body as RegisterInput);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await authService.login(req.body as LoginInput);

    // Solo se auditan los accesos de administradores.
    if (result.user.rol === 'ADMIN') {
      req.user = { sub: result.user.id, username: result.user.username };
      await audit.registrar({
        req,
        accion: 'LOGIN',
        entidad: 'SESION',
        entidadId: result.user.id,
      });
    }

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw unauthorized();
    }
    res.status(200).json({ user: await authService.getProfile(req.user.sub) });
  } catch (error) {
    next(error);
  }
}
