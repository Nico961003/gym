import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserRow } from '../types/user.js';
import type { HttpError } from '../utils/errors.js';
import { hashPassword } from '../utils/password.js';

const repo = {
  findByUsername: vi.fn(),
  findById: vi.fn(),
  existsByUsername: vi.fn(),
  create: vi.fn(),
};
const membresias = { createForUsuario: vi.fn() };

vi.mock('../repositories/user.repository.js', () => ({
  findByUsername: (u: string) => repo.findByUsername(u) as unknown,
  findById: (id: number) => repo.findById(id) as unknown,
  existsByUsername: (u: string) => repo.existsByUsername(u) as unknown,
  create: (d: unknown) => repo.create(d) as unknown,
}));
vi.mock('../repositories/membresia.repository.js', () => ({
  createForUsuario: (id: number) => membresias.createForUsuario(id) as unknown,
}));

const authService = await import('./auth.service.js');

const alta = {
  username: 'martagil',
  nombre: 'Marta',
  apellido: 'Gil',
  edad: 32,
  peso: 62.5,
  estatura: 1.68,
  password: 'Password1!',
};

async function filaCon(password: string): Promise<UserRow> {
  return {
    id: 1,
    username: 'martagil',
    nombre: 'Marta',
    apellido: 'Gil',
    rol: 'CLIENT',
    edad: 32,
    peso: '62.50',
    estatura: '1.68',
    password_hash: await hashPassword(password),
    created_at: new Date(),
    updated_at: new Date(),
  };
}

beforeEach(() => {
  for (const fn of Object.values(repo)) fn.mockReset();
  membresias.createForUsuario.mockReset();
});

describe('register', () => {
  it('hashea la contraseña antes de guardarla', async () => {
    repo.existsByUsername.mockResolvedValue(false);
    repo.create.mockImplementation(async () => filaCon('Password1!'));
    repo.findById.mockImplementation(async () => filaCon('Password1!'));

    await authService.register(alta);

    const guardado = repo.create.mock.calls[0]?.[0] as { passwordHash: string };
    expect(guardado.passwordHash).not.toBe('Password1!');
    expect(guardado.passwordHash).toMatch(/^\$2[aby]\$12\$/);
  });

  it('da de alta la membresía del nuevo socio', async () => {
    repo.existsByUsername.mockResolvedValue(false);
    repo.create.mockImplementation(async () => filaCon('Password1!'));

    const { user } = await authService.register(alta);
    expect(membresias.createForUsuario).toHaveBeenCalledWith(user.id);
  });

  it('devuelve un token firmado', async () => {
    repo.existsByUsername.mockResolvedValue(false);
    repo.create.mockImplementation(async () => filaCon('Password1!'));

    const { token } = await authService.register(alta);
    expect(token.split('.')).toHaveLength(3);
    expect(authService.verifyToken(token)).toEqual({
      sub: 1,
      username: 'martagil',
    });
  });

  it('rechaza con 409 si el usuario ya existe', async () => {
    repo.existsByUsername.mockResolvedValue(true);
    await expect(authService.register(alta)).rejects.toMatchObject({
      status: 409,
    });
    expect(repo.create).not.toHaveBeenCalled();
  });
});

describe('login', () => {
  it('devuelve usuario y token con la contraseña correcta', async () => {
    repo.findByUsername.mockResolvedValue(await filaCon('Password1!'));

    const { user, token } = await authService.login({
      username: 'martagil',
      password: 'Password1!',
    });

    expect(user.username).toBe('martagil');
    expect(token).toEqual(expect.any(String));
  });

  it('rechaza con 401 si la contraseña no coincide', async () => {
    repo.findByUsername.mockResolvedValue(await filaCon('Password1!'));

    await expect(
      authService.login({ username: 'martagil', password: 'Otra1!' })
    ).rejects.toMatchObject({ status: 401 });
  });

  it('rechaza con 401 si el usuario no existe', async () => {
    repo.findByUsername.mockResolvedValue(null);

    await expect(
      authService.login({ username: 'nadie', password: 'Password1!' })
    ).rejects.toMatchObject({ status: 401 });
  });

  it('da el mismo mensaje exista o no el usuario', async () => {
    repo.findByUsername.mockResolvedValue(null);
    const sinUsuario = await authService
      .login({ username: 'nadie', password: 'x' })
      .catch((e: HttpError) => e.message);

    repo.findByUsername.mockResolvedValue(await filaCon('Password1!'));
    const malPassword = await authService
      .login({ username: 'martagil', password: 'x' })
      .catch((e: HttpError) => e.message);

    expect(sinUsuario).toBe(malPassword);
  });

  it('el resultado nunca incluye el hash', async () => {
    repo.findByUsername.mockResolvedValue(await filaCon('Password1!'));
    const resultado = await authService.login({
      username: 'martagil',
      password: 'Password1!',
    });
    expect(JSON.stringify(resultado.user)).not.toContain('$2b$');
  });
});

describe('verifyToken', () => {
  it('rechaza una cadena que no es un JWT', () => {
    expect(() => authService.verifyToken('no-es-un-token')).toThrow();
  });
});

describe('getProfile', () => {
  it('devuelve el perfil público', async () => {
    repo.findById.mockResolvedValue(await filaCon('Password1!'));
    const perfil = await authService.getProfile(1);

    expect(perfil.username).toBe('martagil');
    expect(perfil).not.toHaveProperty('password_hash');
  });

  it('rechaza con 401 si el usuario ya no existe', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(authService.getProfile(99)).rejects.toMatchObject({
      status: 401,
    });
  });
});
