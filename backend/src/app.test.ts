import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

vi.mock('./repositories/user.repository.js', () => ({
  findByUsername: vi.fn(async () => null),
  findById: vi.fn(async () => null),
  existsByUsername: vi.fn(async () => false),
  create: vi.fn(),
  listAll: vi.fn(async () => []),
  update: vi.fn(),
  remove: vi.fn(async () => true),
  contarAdmins: vi.fn(async () => 1),
}));

const { createApp } = await import('./app.js');
const app = createApp();

describe('configuración de la app', () => {
  it('no revela el motor con la cabecera X-Powered-By', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('aplica las cabeceras de seguridad de helmet', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  it('permite el origen configurado en CORS', async () => {
    const res = await request(app)
      .get('/api/publico/promociones')
      .set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBe(
      'http://localhost:3000'
    );
  });

  it('no autoriza un origen ajeno', async () => {
    const res = await request(app)
      .get('/api/publico/promociones')
      .set('Origin', 'http://sitio-malicioso.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('responde 404 en JSON a una ruta desconocida', async () => {
    const res = await request(app).post('/api/ni-idea');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('POST /api/ni-idea');
  });

  it('rechaza un cuerpo JSON mayor de 100 kB', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ username: 'x'.repeat(200_000), password: 'y' }));

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).not.toBe(200);
  });

  it('rechaza un JSON mal formado sin caerse', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ esto no es json');

    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('rutas montadas', () => {
  it('expone las cuatro familias de endpoints', async () => {
    // Sin token: las privadas deben contestar 401, no 404.
    expect((await request(app).get('/api/cliente/panel')).status).toBe(401);
    expect((await request(app).get('/api/admin/productos')).status).toBe(401);
    // Las públicas no exigen token (200 o 503 si no hay BD, nunca 401/404).
    expect(
      [200, 503].includes((await request(app).get('/api/publico/productos')).status)
    ).toBe(true);
  });
});
