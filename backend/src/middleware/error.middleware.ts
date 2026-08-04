import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: `No existe la ruta ${req.method} ${req.originalUrl}`,
  });
}

interface MysqlError extends Error {
  code?: string;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // Express identifica el manejador de errores por su aridad: los 4
  // parámetros son obligatorios aunque no se use el último.
  _next: NextFunction
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      error: err.message,
      ...(err.details ? { detalles: err.details } : {}),
    });
    return;
  }

  const mysqlError = err as MysqlError;

  if (mysqlError.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Ese nombre de usuario ya está registrado' });
    return;
  }

  if (
    mysqlError.code === 'ECONNREFUSED' ||
    mysqlError.code === 'PROTOCOL_CONNECTION_LOST' ||
    mysqlError.code === 'ER_ACCESS_DENIED_ERROR'
  ) {
    console.error('[db]', mysqlError.message);
    res.status(503).json({
      error: 'La base de datos no está disponible. ¿Está levantado Docker?',
    });
    return;
  }

  console.error('[error]', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    ...(env.NODE_ENV === 'development' && err instanceof Error
      ? { detalles: err.message }
      : {}),
  });
}
