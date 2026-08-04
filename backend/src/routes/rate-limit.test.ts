import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

/**
 * Comprueba el límite anti fuerza bruta de /api/auth. Necesita su propia
 * instancia de la app con un límite bajo, así que reimporta los módulos con
 * AUTH_RATE_LIMIT_MAX sobrescrito.
 */
describe('límite de intentos en /api/auth', () => {
  it('responde 429 al superar el número de intentos permitidos', async () => {
    vi.resetModules();
    vi.stubEnv('AUTH_RATE_LIMIT_MAX', '3');

    vi.doMock('../repositories/user.repository.js', () => ({
      findByUsername: vi.fn(async () => null),
      findById: vi.fn(async () => null),
      existsByUsername: vi.fn(async () => false),
      create: vi.fn(),
      listAll: vi.fn(async () => []),
    }));

    const { createApp } = await import('../app.js');
    const app = createApp();

    const intento = () =>
      request(app)
        .post('/api/auth/login')
        .send({ username: 'quien_sea', password: 'loQueSea1!' });

    // Los 3 primeros intentos pasan el filtro y fallan por credenciales.
    for (let i = 0; i < 3; i++) {
      expect((await intento()).status).toBe(401);
    }

    // El cuarto lo corta el limitador.
    const bloqueado = await intento();
    expect(bloqueado.status).toBe(429);
    expect(bloqueado.body.error).toContain('Demasiados intentos');

    vi.unstubAllEnvs();
    vi.doUnmock('../repositories/user.repository.js');
    vi.resetModules();
  });
});
