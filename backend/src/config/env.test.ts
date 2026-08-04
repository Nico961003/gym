import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * `env.ts` valida al importarse, así que cada caso necesita reimportar el
 * módulo con `vi.resetModules()` tras tocar `process.env`.
 */
const base = {
  DB_USER: 'u',
  DB_PASSWORD: 'p',
  JWT_SECRET: 'x'.repeat(32),
};

async function cargar(overrides: Record<string, string | undefined>) {
  vi.resetModules();
  for (const [clave, valor] of Object.entries({ ...base, ...overrides })) {
    // `undefined` elimina la variable: los `.default()` de Zod solo se
    // aplican cuando falta, no cuando llega vacía.
    vi.stubEnv(clave, valor);
  }
  return import('./env.js');
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('validación del entorno', () => {
  it('aplica los valores por defecto', async () => {
    const { env } = await cargar({
      PORT: undefined,
      DB_HOST: undefined,
      DB_PORT: undefined,
      DB_NAME: undefined,
      JWT_EXPIRES_IN: undefined,
      AUTH_RATE_LIMIT_MAX: undefined,
    });

    expect(env.PORT).toBe(4000);
    expect(env.DB_HOST).toBe('127.0.0.1');
    expect(env.DB_PORT).toBe(3307);
    expect(env.DB_NAME).toBe('gym');
    expect(env.JWT_EXPIRES_IN).toBe('2h');
    expect(env.AUTH_RATE_LIMIT_MAX).toBe(20);
  });

  it('convierte a número los valores numéricos', async () => {
    const { env } = await cargar({ PORT: '5000', DB_PORT: '3399' });
    expect(env.PORT).toBe(5000);
    expect(env.DB_PORT).toBe(3399);
  });

  it('rechaza un JWT_SECRET corto', async () => {
    await expect(cargar({ JWT_SECRET: 'corto' })).rejects.toThrow(
      /al menos 32 caracteres/
    );
  });

  it('rechaza si falta el usuario de base de datos', async () => {
    await expect(cargar({ DB_USER: undefined })).rejects.toThrow(
      /Configuración de entorno inválida/
    );
  });

  it('el mensaje de error dice qué variable falla', async () => {
    await expect(cargar({ JWT_SECRET: 'corto' })).rejects.toThrow(
      /JWT_SECRET/
    );
  });

  it('solo admite los entornos previstos', async () => {
    await expect(cargar({ NODE_ENV: 'staging' })).rejects.toThrow();
    const { env } = await cargar({ NODE_ENV: 'production' });
    expect(env.NODE_ENV).toBe('production');
  });

  it('rechaza un puerto que no sea un entero positivo', async () => {
    await expect(cargar({ PORT: '-1' })).rejects.toThrow();
    await expect(cargar({ PORT: 'abc' })).rejects.toThrow();
  });
});
