/**
 * Tests contra la base de datos MySQL real levantada con docker compose.
 *
 *   npm run db:up
 *   npm run test:integration
 *
 * Usan la tabla `usuarios` de verdad y limpian tras de sí los registros que
 * crean (todos con el prefijo `itest_`).
 */
import type { RowDataPacket } from 'mysql2';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { closePool, pool } from '../../src/db/pool.js';

const app = createApp();
const PREFIJO = 'itest_';

const usuario = {
  username: `${PREFIJO}marta`,
  nombre: 'Marta',
  apellido: 'Gil',
  edad: 32,
  peso: 62.5,
  estatura: 1.68,
  password: 'Password1!',
};

async function limpiar(): Promise<void> {
  await pool.execute('DELETE FROM usuarios WHERE username LIKE ?', [
    `${PREFIJO}%`,
  ]);
}

beforeAll(async () => {
  // Falla con un mensaje claro si la BD no está levantada.
  await pool.query('SELECT 1');
  await limpiar();
});

afterAll(async () => {
  await limpiar();
  await closePool();
});

describe('base de datos gym', () => {
  it('existe la tabla usuarios con todas las columnas pedidas', async () => {
    const [rows] = await pool.query<(RowDataPacket & { COLUMN_NAME: string })[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'`
    );
    const columnas = rows.map((r) => r.COLUMN_NAME);

    for (const esperada of [
      'username',
      'nombre',
      'apellido',
      'edad',
      'peso',
      'estatura',
      'password_hash',
    ]) {
      expect(columnas, esperada).toContain(esperada);
    }
  });

  it('no existe ninguna columna que guarde la contraseña en claro', async () => {
    const [rows] = await pool.query<(RowDataPacket & { COLUMN_NAME: string })[]>(
      `SELECT COLUMN_NAME FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'usuarios'`
    );
    expect(rows.map((r) => r.COLUMN_NAME)).not.toContain('password');
  });

  it('el username es único a nivel de base de datos', async () => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT INDEX_NAME FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'usuarios'
          AND COLUMN_NAME = 'username'
          AND NON_UNIQUE = 0`
    );
    expect(rows.length).toBeGreaterThan(0);
  });
});

describe('flujo completo de registro y login contra MySQL', () => {
  let token = '';

  it('registra al usuario y lo persiste', async () => {
    const res = await request(app).post('/api/auth/register').send(usuario);

    expect(res.status).toBe(201);
    expect(res.body.user.id).toEqual(expect.any(Number));
    token = res.body.token;

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE username = ?',
      [usuario.username]
    );
    expect(rows).toHaveLength(1);
  });

  it('guarda en MySQL el hash, nunca la contraseña', async () => {
    const [rows] = await pool.query<(RowDataPacket & { password_hash: string })[]>(
      'SELECT password_hash FROM usuarios WHERE username = ?',
      [usuario.username]
    );
    const hash = rows[0]?.password_hash ?? '';
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
    expect(hash).not.toContain(usuario.password);
  });

  it('respeta los tipos numéricos de peso y estatura', async () => {
    const [rows] = await pool.query<(RowDataPacket & { peso: string; estatura: string; edad: number })[]>('SELECT edad, peso, estatura FROM usuarios WHERE username = ?', [
      usuario.username,
    ]);
    expect(Number(rows[0]?.peso)).toBe(62.5);
    expect(Number(rows[0]?.estatura)).toBe(1.68);
    expect(rows[0]?.edad).toBe(32);
  });

  it('impide registrar dos veces el mismo username', async () => {
    const res = await request(app).post('/api/auth/register').send(usuario);
    expect(res.status).toBe(409);
  });

  it('inicia sesión con las credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: usuario.username, password: usuario.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('rechaza el login con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: usuario.username, password: 'Incorrecta1!' });

    expect(res.status).toBe(401);
  });

  it('devuelve el perfil con el token emitido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe(usuario.username);
  });

  it('la base de datos rechaza una edad fuera de rango (CHECK)', async () => {
    await expect(
      pool.execute(
        `INSERT INTO usuarios
           (username, nombre, apellido, edad, peso, estatura, password_hash)
         VALUES (?, 'X', 'Y', 5, 70, 1.7, 'hash')`,
        [`${PREFIJO}menor`]
      )
    ).rejects.toThrow();
  });
});

describe('GET /api/health', () => {
  it('informa de que la base de datos está conectada', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.database).toBe('conectada');
  });
});
