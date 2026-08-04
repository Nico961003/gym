import { describe, expect, it } from 'vitest';
import {
  badRequest,
  conflict,
  HttpError,
  notFound,
  unauthorized,
} from './errors.js';

describe('HttpError', () => {
  it('guarda estado, mensaje y detalles', () => {
    const error = new HttpError(418, 'Soy una tetera', { pista: 'RFC 2324' });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HttpError');
    expect(error.status).toBe(418);
    expect(error.message).toBe('Soy una tetera');
    expect(error.details).toEqual({ pista: 'RFC 2324' });
  });

  it('los detalles son opcionales', () => {
    expect(new HttpError(500, 'Ups').details).toBeUndefined();
  });
});

describe('atajos', () => {
  it('badRequest devuelve 400', () => {
    const error = badRequest('Datos inválidos', [{ campo: 'x' }]);
    expect(error.status).toBe(400);
    expect(error.details).toEqual([{ campo: 'x' }]);
  });

  it('unauthorized devuelve 401 con mensaje genérico por defecto', () => {
    expect(unauthorized().status).toBe(401);
    expect(unauthorized().message).toBe('Credenciales inválidas');
    expect(unauthorized('Otro').message).toBe('Otro');
  });

  it('notFound devuelve 404', () => {
    expect(notFound().status).toBe(404);
    expect(notFound('No existe la promoción').message).toBe(
      'No existe la promoción'
    );
  });

  it('conflict devuelve 409', () => {
    expect(conflict('Ya existe').status).toBe(409);
  });

  it('todos son capturables como HttpError', () => {
    for (const error of [
      badRequest('a'),
      unauthorized(),
      notFound(),
      conflict('c'),
    ]) {
      expect(error).toBeInstanceOf(HttpError);
    }
  });
});
