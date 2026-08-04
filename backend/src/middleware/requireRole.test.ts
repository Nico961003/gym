import type { NextFunction, Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserRow } from '../types/user.js';
import type { HttpError } from '../utils/errors.js';

const findById = vi.fn();
vi.mock('../repositories/user.repository.js', () => ({
  findById: (id: number) => findById(id) as unknown,
}));

const { requireRole } = await import('./requireRole.js');

const fila = (rol: 'ADMIN' | 'CLIENT'): UserRow => ({
  id: 7,
  username: 'quien',
  nombre: 'Quien',
  apellido: 'Sea',
  rol,
  edad: 30,
  peso: 70,
  estatura: 1.75,
  password_hash: '$2b$12$x',
  created_at: new Date(),
  updated_at: new Date(),
});

async function ejecutar(
  roles: ('ADMIN' | 'CLIENT')[],
  user?: { sub: number; username: string }
) {
  const req = { user } as Request;
  const next = vi.fn();
  await requireRole(...roles)(req, {} as Response, next as unknown as NextFunction);
  return { req, next };
}

beforeEach(() => {
  findById.mockReset();
});

describe('requireRole', () => {
  it('deja pasar a quien tiene el rol exigido', async () => {
    findById.mockResolvedValue(fila('ADMIN'));
    const { next } = await ejecutar(['ADMIN'], { sub: 7, username: 'quien' });
    expect(next).toHaveBeenCalledWith();
  });

  it('rellena req.userRow para que lo use la auditoría', async () => {
    const usuario = fila('ADMIN');
    findById.mockResolvedValue(usuario);
    const { req } = await ejecutar(['ADMIN'], { sub: 7, username: 'quien' });
    expect(req.userRow).toBe(usuario);
  });

  it('devuelve 403 a quien no tiene el rol', async () => {
    findById.mockResolvedValue(fila('CLIENT'));
    const { next } = await ejecutar(['ADMIN'], { sub: 7, username: 'quien' });

    const error = next.mock.calls[0]?.[0] as HttpError;
    expect(error.status).toBe(403);
    expect(error.message).toBe('No tienes permisos para esta operación');
  });

  it('acepta varios roles a la vez', async () => {
    findById.mockResolvedValue(fila('CLIENT'));
    const { next } = await ejecutar(['ADMIN', 'CLIENT'], {
      sub: 7,
      username: 'quien',
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('devuelve 401 si no hay usuario en la petición', async () => {
    const { next } = await ejecutar(['ADMIN'], undefined);
    expect((next.mock.calls[0]?.[0] as HttpError).status).toBe(401);
    expect(findById).not.toHaveBeenCalled();
  });

  it('devuelve 401 si el usuario del token ya no existe', async () => {
    findById.mockResolvedValue(null);
    const { next } = await ejecutar(['ADMIN'], { sub: 7, username: 'quien' });

    const error = next.mock.calls[0]?.[0] as HttpError;
    expect(error.status).toBe(401);
    expect(error.message).toBe('La sesión ya no es válida');
  });

  it('lee el rol de la BD en cada petición, no del token', async () => {
    // Mismo token, rol degradado entre una llamada y la siguiente.
    findById.mockResolvedValueOnce(fila('ADMIN'));
    const primera = await ejecutar(['ADMIN'], { sub: 7, username: 'quien' });
    expect(primera.next).toHaveBeenCalledWith();

    findById.mockResolvedValueOnce(fila('CLIENT'));
    const segunda = await ejecutar(['ADMIN'], { sub: 7, username: 'quien' });
    expect((segunda.next.mock.calls[0]?.[0] as HttpError).status).toBe(403);
  });

  it('propaga los errores del repositorio', async () => {
    findById.mockRejectedValue(new Error('BD caída'));
    const { next } = await ejecutar(['ADMIN'], { sub: 7, username: 'quien' });
    expect((next.mock.calls[0]?.[0] as Error).message).toBe('BD caída');
  });
});
