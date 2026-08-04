import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserRow } from '../types/user.js';
import { verifyPassword } from '../utils/password.js';

const repo = {
  findByUsername: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updatePassword: vi.fn(),
};
const membresias = { createForUsuario: vi.fn() };

vi.mock('../repositories/user.repository.js', () => ({
  findByUsername: (u: string) => repo.findByUsername(u) as unknown,
  create: (d: unknown) => repo.create(d) as unknown,
  update: (id: number, d: unknown) => repo.update(id, d) as unknown,
  updatePassword: (id: number, h: string) =>
    repo.updatePassword(id, h) as unknown,
}));
vi.mock('../repositories/membresia.repository.js', () => ({
  createForUsuario: (id: number, plan?: string) =>
    membresias.createForUsuario(id, plan) as unknown,
}));

const { seedAdmin } = await import('./seed.js');

function fila(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: 3,
    username: 'admin',
    nombre: 'Admin',
    apellido: 'Rodriguez',
    rol: 'ADMIN',
    edad: 30,
    peso: '75.00',
    estatura: '1.75',
    password_hash: '$2b$12$hashviejo',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

beforeEach(() => {
  for (const fn of Object.values(repo)) fn.mockReset();
  membresias.createForUsuario.mockReset();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('cuando el administrador no existe', () => {
  beforeEach(() => {
    repo.findByUsername.mockResolvedValue(null);
    repo.create.mockImplementation(async () => fila());
  });

  it('lo crea con rol ADMIN', async () => {
    const resultado = await seedAdmin({ verbose: false });

    expect(resultado.accion).toBe('creado');
    expect(repo.create).toHaveBeenCalledTimes(1);
    expect(repo.create.mock.calls[0]?.[0]).toMatchObject({
      username: 'admin',
      rol: 'ADMIN',
    });
  });

  it('guarda la contraseña hasheada, nunca en claro', async () => {
    await seedAdmin({ verbose: false });

    const datos = repo.create.mock.calls[0]?.[0] as { passwordHash: string };
    expect(datos.passwordHash).toMatch(/^\$2[aby]\$12\$/);
    expect(datos).not.toHaveProperty('password');
    expect(JSON.stringify(datos)).not.toContain('Password_123');
  });

  it('el hash corresponde a la contraseña configurada', async () => {
    await seedAdmin({ verbose: false });

    const { passwordHash } = repo.create.mock.calls[0]?.[0] as {
      passwordHash: string;
    };
    await expect(verifyPassword('Password_123', passwordHash)).resolves.toBe(
      true
    );
    await expect(verifyPassword('otra-cosa', passwordHash)).resolves.toBe(
      false
    );
  });

  it('le da de alta una membresía', async () => {
    await seedAdmin({ verbose: false });
    expect(membresias.createForUsuario).toHaveBeenCalledWith(3, 'PREMIUM');
  });
});

describe('cuando el administrador ya existe', () => {
  it('no lo duplica ni toca su contraseña', async () => {
    repo.findByUsername.mockResolvedValue(fila());

    const resultado = await seedAdmin({ verbose: false });

    expect(resultado.accion).toBe('sin-cambios');
    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.updatePassword).not.toHaveBeenCalled();
  });

  it('es idempotente: dos arranques seguidos no cambian nada', async () => {
    repo.findByUsername.mockResolvedValue(fila());

    await seedAdmin({ verbose: false });
    await seedAdmin({ verbose: false });

    expect(repo.create).not.toHaveBeenCalled();
    expect(repo.updatePassword).not.toHaveBeenCalled();
  });

  it('con --force sí restablece la contraseña', async () => {
    repo.findByUsername.mockResolvedValue(fila());

    const resultado = await seedAdmin({
      forzarPassword: true,
      verbose: false,
    });

    expect(resultado.accion).toBe('password-restablecida');
    expect(repo.updatePassword).toHaveBeenCalledTimes(1);

    const [id, hash] = repo.updatePassword.mock.calls[0] as [number, string];
    expect(id).toBe(3);
    await expect(verifyPassword('Password_123', hash)).resolves.toBe(true);
  });

  it('le restituye el rol si lo había perdido', async () => {
    repo.findByUsername.mockResolvedValue(fila({ rol: 'CLIENT' }));

    await seedAdmin({ verbose: false });

    expect(repo.update).toHaveBeenCalledTimes(1);
    expect(repo.update.mock.calls[0]?.[1]).toMatchObject({ rol: 'ADMIN' });
  });

  it('no toca nada si el rol ya es correcto', async () => {
    repo.findByUsername.mockResolvedValue(fila());
    await seedAdmin({ verbose: false });
    expect(repo.update).not.toHaveBeenCalled();
  });
});

describe('validación de las credenciales configuradas', () => {
  it('rechaza una contraseña que incumple las reglas', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'debil');
    vi.resetModules();
    const { seedAdmin: seedRecargado } = await import('./seed.js');

    await expect(seedRecargado({ verbose: false })).rejects.toThrow();

    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('rechaza un nombre de usuario inválido', async () => {
    vi.stubEnv('ADMIN_USERNAME', 'con espacio');
    vi.resetModules();
    const { seedAdmin: seedRecargado } = await import('./seed.js');

    await expect(seedRecargado({ verbose: false })).rejects.toThrow();

    vi.unstubAllEnvs();
    vi.resetModules();
  });
});
