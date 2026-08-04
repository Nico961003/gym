import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const checkDatabaseConnection = vi.fn();

vi.mock('../db/pool.js', () => ({
  pool: {},
  checkDatabaseConnection: () => checkDatabaseConnection() as unknown,
  closePool: vi.fn(),
}));
vi.mock('../repositories/user.repository.js', () => ({
  findByUsername: vi.fn(),
  findById: vi.fn(),
  existsByUsername: vi.fn(),
  create: vi.fn(),
  listAll: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  contarAdmins: vi.fn(),
}));

const { createApp } = await import('../app.js');
const app = createApp();

beforeEach(() => {
  checkDatabaseConnection.mockReset();
});

describe('GET /api/health', () => {
  it('devuelve 200 y "conectada" cuando la BD responde', async () => {
    checkDatabaseConnection.mockResolvedValue(true);
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('conectada');
  });

  it('devuelve 503 y "sin conexión" cuando la BD no responde', async () => {
    checkDatabaseConnection.mockResolvedValue(false);
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body.status).toBe('degradado');
    expect(res.body.database).toBe('sin conexión');
  });

  it('incluye una marca de tiempo ISO', async () => {
    checkDatabaseConnection.mockResolvedValue(true);
    const res = await request(app).get('/api/health');

    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(Number.isNaN(Date.parse(res.body.timestamp as string))).toBe(false);
  });

  it('no exige autenticación', async () => {
    checkDatabaseConnection.mockResolvedValue(true);
    expect((await request(app).get('/api/health')).status).not.toBe(401);
  });
});
