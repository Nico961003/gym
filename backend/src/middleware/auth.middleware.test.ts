import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { describe, expect, it, vi } from 'vitest';
import { env } from '../config/env.js';
import { HttpError } from '../utils/errors.js';
import { requireAuth } from './auth.middleware.js';

function peticion(authorization?: string): Request {
  return {
    get: (nombre: string) =>
      nombre.toLowerCase() === 'authorization' ? authorization : undefined,
  } as unknown as Request;
}

function ejecutar(authorization?: string) {
  const req = peticion(authorization);
  const next = vi.fn();
  requireAuth(req, {} as Response, next as unknown as NextFunction);
  return { req, next };
}

const tokenValido = jwt.sign({ sub: 7, username: 'martagil' }, env.JWT_SECRET, {
  expiresIn: '1h',
});

describe('requireAuth', () => {
  it('acepta un Bearer válido y rellena req.user', () => {
    const { req, next } = ejecutar(`Bearer ${tokenValido}`);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ sub: 7, username: 'martagil' });
  });

  it('tolera espacios sobrantes tras el esquema', () => {
    const { req } = ejecutar(`Bearer   ${tokenValido}  `);
    expect(req.user?.sub).toBe(7);
  });

  it('rechaza si no hay cabecera', () => {
    const { next } = ejecutar(undefined);
    const error = next.mock.calls[0]?.[0] as HttpError;

    expect(error.status).toBe(401);
    expect(error.message).toBe('Falta el token de autenticación');
  });

  it('rechaza un esquema que no sea Bearer', () => {
    const { next } = ejecutar('Basic bWFydGE6MTIzNA==');
    expect((next.mock.calls[0]?.[0] as HttpError).status).toBe(401);
  });

  it('rechaza un token corrupto', () => {
    const { next } = ejecutar('Bearer esto-no-es-un-jwt');
    const error = next.mock.calls[0]?.[0] as HttpError;

    expect(error.status).toBe(401);
    expect(error.message).toBe('Token inválido o caducado');
  });

  it('rechaza un token firmado con otro secreto', () => {
    const ajeno = jwt.sign({ sub: 7, username: 'x' }, 'otro-secreto-distinto');
    expect((ejecutar(`Bearer ${ajeno}`).next.mock.calls[0]?.[0] as HttpError)
      .status).toBe(401);
  });

  it('rechaza un token caducado', () => {
    const caducado = jwt.sign({ sub: 7, username: 'x' }, env.JWT_SECRET, {
      expiresIn: '-1s',
    });
    expect((ejecutar(`Bearer ${caducado}`).next.mock.calls[0]?.[0] as HttpError)
      .status).toBe(401);
  });

  it('rechaza un token con payload de forma inesperada', () => {
    const raro = jwt.sign({ sub: 'no-soy-un-numero' }, env.JWT_SECRET);
    expect((ejecutar(`Bearer ${raro}`).next.mock.calls[0]?.[0] as HttpError)
      .status).toBe(401);
  });
});
