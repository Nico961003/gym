import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { badRequest } from '../utils/errors.js';

/**
 * Valida `req.body` contra un esquema de Zod y lo sustituye por el resultado
 * ya tipado y normalizado (trim, coerción de números…).
 */
export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        campo: issue.path.join('.') || '(cuerpo)',
        mensaje: issue.message,
      }));
      next(badRequest('Los datos enviados no son válidos', details));
      return;
    }

    req.body = result.data;
    next();
  };
}
