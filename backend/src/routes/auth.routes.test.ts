import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// El repositorio se sustituye por un doble en memoria: estos tests ejercitan
// las rutas, la validación y el servicio SIN necesidad de MySQL.
const store = new Map<string, Record<string, unknown>>();
let nextId = 1;

vi.mock('../repositories/user.repository.js', () => ({
  findByUsername: vi.fn(async (username: string) => store.get(username) ?? null),
  findById: vi.fn(async (id: number) => {
    for (const row of store.values()) {
      if (row.id === id) return row;
    }
    return null;
  }),
  existsByUsername: vi.fn(async (username: string) => store.has(username)),
  create: vi.fn(async (data: Record<string, unknown>) => {
    const row = {
      id: nextId++,
      username: data.username,
      nombre: data.nombre,
      apellido: data.apellido,
      edad: data.edad,
      peso: String(data.peso),
      estatura: String(data.estatura),
      password_hash: data.passwordHash,
      created_at: new Date(),
      updated_at: new Date(),
    };
    store.set(row.username as string, row);
    return row;
  }),
  listAll: vi.fn(async () => [...store.values()]),
  update: vi.fn(),
  remove: vi.fn(async () => true),
  contarAdmins: vi.fn(async () => 1),
}));

// El alta de usuario crea también su membresía; aquí no hay MySQL.
vi.mock('../repositories/membresia.repository.js', () => ({
  createForUsuario: vi.fn(async () => undefined),
  findByUsuario: vi.fn(async () => null),
  listAsistencias: vi.fn(async () => []),
  resumenAsistencias: vi.fn(async () => ({
    totalMes: 0,
    totalAnio: 0,
    ultimaVisita: null,
  })),
  registrarAsistencia: vi.fn(async () => undefined),
}));

const { createApp } = await import('../app.js');
const app = createApp();

const usuarioValido = {
  username: 'martagil',
  nombre: 'Marta',
  apellido: 'Gil',
  edad: 32,
  peso: 62.5,
  estatura: 1.68,
  password: 'Password1!',
};

beforeEach(() => {
  store.clear();
  nextId = 1;
});

describe('POST /api/auth/register', () => {
  it('crea el usuario y devuelve 201 con token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(usuarioValido);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({
      username: 'martagil',
      nombre: 'Marta',
      apellido: 'Gil',
      edad: 32,
      peso: 62.5,
      estatura: 1.68,
    });
  });

  it('NUNCA devuelve el hash ni la contraseña', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(usuarioValido);

    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user).not.toHaveProperty('password_hash');
    expect(JSON.stringify(res.body)).not.toContain('Password1!');
  });

  it('guarda la contraseña hasheada, no en claro', async () => {
    await request(app).post('/api/auth/register').send(usuarioValido);
    const guardado = store.get('martagil');
    expect(guardado?.password_hash).not.toBe('Password1!');
    expect(guardado?.password_hash).toMatch(/^\$2[aby]\$12\$/);
  });

  it('rechaza con 400 una contraseña que incumple las reglas', async () => {
    const casos: [string, string][] = [
      ['Ab1!def', 'al menos 8 caracteres'],
      ['password1!', 'una letra mayúscula'],
      ['PASSWORD1!', 'una letra minúscula'],
      ['Password12', 'un carácter especial'],
    ];

    for (const [password, fragmento] of casos) {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...usuarioValido, password });

      expect(res.status, password).toBe(400);
      expect(JSON.stringify(res.body.detalles)).toContain(fragmento);
    }
  });

  it('rechaza con 409 un username ya registrado', async () => {
    await request(app).post('/api/auth/register').send(usuarioValido);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...usuarioValido, password: 'OtraClave1!' });

    expect(res.status).toBe(409);
  });

  it('rechaza con 400 si faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'solo' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(usuarioValido);
  });

  it('devuelve token y usuario con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'martagil', password: 'Password1!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.username).toBe('martagil');
  });

  it('devuelve 401 con la contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'martagil', password: 'Incorrecta1!' });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
  });

  it('devuelve 401 con un usuario inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'nadie', password: 'Password1!' });

    expect(res.status).toBe(401);
  });

  it('no distingue en el mensaje entre usuario y contraseña erróneos', async () => {
    const [sinUsuario, malPassword] = await Promise.all([
      request(app)
        .post('/api/auth/login')
        .send({ username: 'nadie', password: 'Password1!' }),
      request(app)
        .post('/api/auth/login')
        .send({ username: 'martagil', password: 'Incorrecta1!' }),
    ]);

    expect(sinUsuario.body.error).toBe(malPassword.body.error);
  });

  it('no aplica las reglas de complejidad al iniciar sesión', async () => {
    // Una contraseña "débil" en el login debe dar 401, no 400: la validación
    // de complejidad es cosa del registro.
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'martagil', password: 'x' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('devuelve el perfil con un token válido', async () => {
    const registro = await request(app)
      .post('/api/auth/register')
      .send(usuarioValido);

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${registro.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('martagil');
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  it('devuelve 401 sin cabecera Authorization', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('devuelve 401 con un token corrupto', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer no-es-un-token');
    expect(res.status).toBe(401);
  });

  it('devuelve 401 si el esquema no es Bearer', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Basic bWFydGE6MTIzNA==');
    expect(res.status).toBe(401);
  });
});

describe('rutas inexistentes', () => {
  it('devuelve 404 en JSON', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('/api/no-existe');
  });
});
