import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { HttpError } from '../utils/errors.js';
import { validateBody } from './validate.js';

const esquema = z.object({
  nombre: z.string().trim().min(2, 'Nombre demasiado corto'),
  edad: z.coerce.number().int().min(0),
});

function ejecutar(body: unknown) {
  const req = { body } as Request;
  const next = vi.fn() as unknown as NextFunction;
  validateBody(esquema)(req, {} as Response, next);
  return { req, next: next as unknown as ReturnType<typeof vi.fn> };
}

describe('validateBody', () => {
  it('deja pasar un cuerpo válido', () => {
    const { next } = ejecutar({ nombre: 'Marta', edad: 32 });
    expect(next).toHaveBeenCalledWith();
  });

  it('sustituye req.body por el dato ya normalizado', () => {
    const { req } = ejecutar({ nombre: '  Marta  ', edad: '32' });
    expect(req.body).toEqual({ nombre: 'Marta', edad: 32 });
  });

  it('pasa un HttpError 400 a next cuando falla', () => {
    const { next } = ejecutar({ nombre: 'x' });
    const error = next.mock.calls[0]?.[0] as HttpError;

    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe(400);
    expect(error.message).toBe('Los datos enviados no son válidos');
  });

  it('incluye el campo y el mensaje de cada error', () => {
    const { next } = ejecutar({ nombre: 'x', edad: -1 });
    const error = next.mock.calls[0]?.[0] as HttpError;
    const detalles = error.details as { campo: string; mensaje: string }[];

    expect(detalles).toHaveLength(2);
    expect(detalles.map((d) => d.campo)).toEqual(['nombre', 'edad']);
    expect(detalles[0]?.mensaje).toBe('Nombre demasiado corto');
  });

  it('etiqueta como "(cuerpo)" los errores sin campo concreto', () => {
    const req = { body: 'no soy un objeto' } as Request;
    const next = vi.fn();
    validateBody(esquema)(req, {} as Response, next as unknown as NextFunction);

    const error = next.mock.calls[0]?.[0] as HttpError;
    const detalles = error.details as { campo: string }[];
    expect(detalles[0]?.campo).toBe('(cuerpo)');
  });

  it('no modifica req.body si la validación falla', () => {
    const original = { nombre: 'x' };
    const { req } = ejecutar(original);
    expect(req.body).toBe(original);
  });
});
