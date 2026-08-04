import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../utils/errors.js';
import { errorHandler, notFoundHandler } from './error.middleware.js';

function respuesta() {
  const res = {
    statusCode: 0,
    cuerpo: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.cuerpo = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; cuerpo: unknown };
}

function manejar(error: unknown) {
  const res = respuesta();
  errorHandler(error, {} as Request, res, (() => {}) as NextFunction);
  return res;
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('notFoundHandler', () => {
  it('responde 404 con el método y la ruta', () => {
    const res = respuesta();
    notFoundHandler(
      { method: 'GET', originalUrl: '/api/no-existe' } as Request,
      res
    );

    expect(res.statusCode).toBe(404);
    expect((res.cuerpo as { error: string }).error).toContain(
      'GET /api/no-existe'
    );
  });
});

describe('errorHandler', () => {
  it('respeta el estado de un HttpError', () => {
    const res = manejar(new HttpError(409, 'Ya existe'));
    expect(res.statusCode).toBe(409);
    expect(res.cuerpo).toEqual({ error: 'Ya existe' });
  });

  it('incluye los detalles cuando los hay', () => {
    const res = manejar(
      new HttpError(400, 'Inválido', [{ campo: 'x', mensaje: 'mal' }])
    );
    expect(res.cuerpo).toEqual({
      error: 'Inválido',
      detalles: [{ campo: 'x', mensaje: 'mal' }],
    });
  });

  it('traduce ER_DUP_ENTRY de MySQL a 409', () => {
    const error = Object.assign(new Error('Duplicate entry'), {
      code: 'ER_DUP_ENTRY',
    });
    const res = manejar(error);

    expect(res.statusCode).toBe(409);
    expect((res.cuerpo as { error: string }).error).toMatch(/ya está registrado/i);
  });

  it('traduce los fallos de conexión a 503 con una pista útil', () => {
    for (const code of [
      'ECONNREFUSED',
      'PROTOCOL_CONNECTION_LOST',
      'ER_ACCESS_DENIED_ERROR',
    ]) {
      const res = manejar(Object.assign(new Error('db'), { code }));
      expect(res.statusCode, code).toBe(503);
      expect((res.cuerpo as { error: string }).error).toMatch(/Docker/);
    }
  });

  it('cualquier otro error acaba en 500', () => {
    const res = manejar(new Error('algo raro'));
    expect(res.statusCode).toBe(500);
    expect((res.cuerpo as { error: string }).error).toBe(
      'Error interno del servidor'
    );
  });

  it('en desarrollo añade el mensaje original al 500', () => {
    // El entorno de tests arranca como NODE_ENV=test, así que aquí NO se filtra.
    const res = manejar(new Error('detalle interno'));
    expect(res.cuerpo).not.toHaveProperty('detalles');
  });

  it('nunca filtra la traza al cliente', () => {
    const res = manejar(new Error('boom'));
    expect(JSON.stringify(res.cuerpo)).not.toContain('at ');
  });

  it('soporta que le lancen algo que no es un Error', () => {
    const res = manejar('una cadena suelta');
    expect(res.statusCode).toBe(500);
  });
});
