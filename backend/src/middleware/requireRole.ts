import type { NextFunction, Request, Response } from 'express';
import * as userRepository from '../repositories/user.repository.js';
import type { Rol } from '../types/user.js';
import { HttpError, unauthorized } from '../utils/errors.js';

/**
 * Exige que el usuario del token tenga uno de los roles indicados.
 * Debe ir SIEMPRE detrás de `requireAuth`.
 *
 * El rol se lee de la base de datos, no del token: así, si a alguien se le
 * retira el rol de administrador, deja de tener acceso al instante en vez de
 * seguir con él hasta que caduque su JWT.
 */
export function requireRole(...roles: Rol[]) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw unauthorized();
      }

      const usuario = await userRepository.findById(req.user.sub);

      if (!usuario) {
        throw unauthorized('La sesión ya no es válida');
      }

      if (!roles.includes(usuario.rol)) {
        throw new HttpError(403, 'No tienes permisos para esta operación');
      }

      req.userRow = usuario;
      next();
    } catch (error) {
      next(error);
    }
  };
}
