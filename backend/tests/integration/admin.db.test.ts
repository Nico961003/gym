/**
 * Roles, CRUD del panel de administración y auditoría, contra MySQL real.
 *
 *   npm run db:up && npm run db:migrate && npm run test:integration
 */
import type { RowDataPacket } from 'mysql2';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app.js';
import { closePool, pool } from '../../src/db/pool.js';

const app = createApp();
const PREFIJO = 'itadm_';

const admin = {
  username: `${PREFIJO}admin`,
  nombre: 'Ada',
  apellido: 'Root',
  edad: 40,
  peso: 70,
  estatura: 1.7,
  password: 'Password1!',
};

const cliente = {
  username: `${PREFIJO}cliente`,
  nombre: 'Cris',
  apellido: 'Cliente',
  edad: 25,
  peso: 65,
  estatura: 1.7,
  password: 'Password1!',
};

let tokenAdmin = '';
let tokenCliente = '';
let idAdmin = 0;

async function limpiar(): Promise<void> {
  await pool.execute(
    'DELETE FROM admin_logs WHERE admin_username LIKE ?',
    [`${PREFIJO}%`]
  );
  await pool.execute('DELETE FROM usuarios WHERE username LIKE ?', [
    `${PREFIJO}%`,
  ]);
  await pool.execute('DELETE FROM promociones WHERE codigo LIKE ?', [
    `${PREFIJO.toUpperCase()}%`,
  ]);
  await pool.execute('DELETE FROM productos WHERE nombre LIKE ?', [
    `${PREFIJO}%`,
  ]);
}

beforeAll(async () => {
  await pool.query('SELECT 1');
  await limpiar();

  const altaAdmin = await request(app).post('/api/auth/register').send(admin);
  idAdmin = altaAdmin.body.user.id;
  // El alta siempre crea CLIENT; el rol ADMIN se otorga en base de datos.
  await pool.execute("UPDATE usuarios SET rol = 'ADMIN' WHERE id = ?", [
    idAdmin,
  ]);

  const loginAdmin = await request(app)
    .post('/api/auth/login')
    .send({ username: admin.username, password: admin.password });
  tokenAdmin = loginAdmin.body.token;

  const altaCliente = await request(app)
    .post('/api/auth/register')
    .send(cliente);
  tokenCliente = altaCliente.body.token;
});

afterAll(async () => {
  await limpiar();
  await closePool();
});

describe('roles', () => {
  it('quien se registra es CLIENT por defecto', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenCliente}`);
    expect(res.body.user.rol).toBe('CLIENT');
  });

  it('el administrador se identifica como ADMIN', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.body.user.rol).toBe('ADMIN');
  });

  it('un CLIENT no puede entrar en el panel de administración', async () => {
    for (const ruta of [
      '/api/admin/promociones',
      '/api/admin/productos',
      '/api/admin/usuarios',
      '/api/admin/logs',
    ]) {
      const res = await request(app)
        .get(ruta)
        .set('Authorization', `Bearer ${tokenCliente}`);
      expect(res.status, ruta).toBe(403);
    }
  });

  it('sin token tampoco', async () => {
    const res = await request(app).get('/api/admin/promociones');
    expect(res.status).toBe(401);
  });

  it('el rol se lee de la BD, no del token: al degradar a CLIENT pierde acceso al instante', async () => {
    await pool.execute("UPDATE usuarios SET rol = 'CLIENT' WHERE id = ?", [
      idAdmin,
    ]);

    const denegado = await request(app)
      .get('/api/admin/promociones')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(denegado.status).toBe(403);

    await pool.execute("UPDATE usuarios SET rol = 'ADMIN' WHERE id = ?", [
      idAdmin,
    ]);

    const permitido = await request(app)
      .get('/api/admin/promociones')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(permitido.status).toBe(200);
  });
});

describe('CRUD de promociones', () => {
  let id = 0;

  const nueva = {
    titulo: 'Promo de prueba',
    descripcion: 'Una promoción creada por los tests de integración.',
    tipo: 'PORCENTAJE',
    valor: 25,
    codigo: `${PREFIJO.toUpperCase()}TEST`,
    fechaInicio: '2026-01-01',
    fechaFin: '2026-12-31',
    activa: true,
    destacada: false,
  };

  it('crea', async () => {
    const res = await request(app)
      .post('/api/admin/promociones')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(nueva);

    expect(res.status).toBe(201);
    expect(res.body.promocion.titulo).toBe(nueva.titulo);
    id = res.body.promocion.id;
  });

  it('lee', async () => {
    const res = await request(app)
      .get('/api/admin/promociones')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.promociones.some((p: { id: number }) => p.id === id)).toBe(
      true
    );
  });

  it('actualiza', async () => {
    const res = await request(app)
      .put(`/api/admin/promociones/${id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...nueva, valor: 35 });

    expect(res.status).toBe(200);
    expect(res.body.promocion.valor).toBe(35);
  });

  it('rechaza datos inválidos con 400', async () => {
    const res = await request(app)
      .put(`/api/admin/promociones/${id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...nueva, fechaFin: '2025-01-01' });

    expect(res.status).toBe(400);
  });

  it('borra', async () => {
    const res = await request(app)
      .delete(`/api/admin/promociones/${id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(204);

    const despues = await request(app)
      .delete(`/api/admin/promociones/${id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(despues.status).toBe(404);
  });
});

describe('CRUD de productos', () => {
  let id = 0;

  const nuevo = {
    nombre: `${PREFIJO}Cinturón`,
    precio: 34,
    stock: 12,
    fechaRegistro: '2026-08-01',
  };

  it('crea, lee, actualiza y borra', async () => {
    const creado = await request(app)
      .post('/api/admin/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send(nuevo);
    expect(creado.status).toBe(201);
    id = creado.body.producto.id;

    const leido = await request(app)
      .get('/api/admin/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(leido.body.productos.some((p: { id: number }) => p.id === id)).toBe(
      true
    );

    const actualizado = await request(app)
      .put(`/api/admin/productos/${id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ ...nuevo, precio: 39.5, stock: 0 });
    expect(actualizado.body.producto.precio).toBe(39.5);
    expect(actualizado.body.producto.stock).toBe(0);

    const borrado = await request(app)
      .delete(`/api/admin/productos/${id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(borrado.status).toBe(204);
  });
});

describe('CRUD de usuarios', () => {
  it('lista usuarios sin exponer ningún hash', async () => {
    const res = await request(app)
      .get('/api/admin/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('password_hash');
    expect(JSON.stringify(res.body)).not.toContain('$2b$');
  });

  it('cambia el rol de un cliente', async () => {
    const lista = await request(app)
      .get('/api/admin/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    const objetivo = lista.body.usuarios.find(
      (u: { username: string }) => u.username === cliente.username
    );

    const res = await request(app)
      .put(`/api/admin/usuarios/${objetivo.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: 'Cris',
        apellido: 'Cliente',
        rol: 'ADMIN',
        edad: 26,
        peso: 66,
        estatura: 1.7,
      });

    expect(res.status).toBe(200);
    expect(res.body.usuario.rol).toBe('ADMIN');
    expect(res.body.usuario.edad).toBe(26);
  });

  it('no deja borrarse a uno mismo', async () => {
    const res = await request(app)
      .delete(`/api/admin/usuarios/${idAdmin}`)
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(res.status).toBe(409);
  });
});

describe('auditoría de acciones de administrador', () => {
  it('registra el alta con el diff y sin datos sensibles', async () => {
    const creado = await request(app)
      .post('/api/admin/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: `${PREFIJO}Auditado`,
        precio: 10,
        stock: 5,
        fechaRegistro: '2026-08-01',
      });

    const res = await request(app)
      .get('/api/admin/logs?entidad=PRODUCTO')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    const log = res.body.logs.find(
      (l: { entidadId: number }) => l.entidadId === creado.body.producto.id
    );

    expect(log).toBeDefined();
    expect(log.accion).toBe('CREAR');
    expect(log.entidad).toBe('PRODUCTO');
    expect(log.adminUsername).toBe(admin.username);
    expect(JSON.stringify(log)).not.toContain('$2b$');
  });

  it('en una edición guarda SOLO el campo que cambió', async () => {
    const creado = await request(app)
      .post('/api/admin/productos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: `${PREFIJO}Diff`,
        precio: 10,
        stock: 5,
        fechaRegistro: '2026-08-01',
      });

    await request(app)
      .put(`/api/admin/productos/${creado.body.producto.id}`)
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre: `${PREFIJO}Diff`,
        precio: 12,
        stock: 5,
        fechaRegistro: '2026-08-01',
      });

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT cambios FROM admin_logs
        WHERE entidad = 'PRODUCTO' AND accion = 'ACTUALIZAR'
          AND entidad_id = ?
        ORDER BY id DESC LIMIT 1`,
      [creado.body.producto.id]
    );

    const cambios =
      typeof rows[0]?.cambios === 'string'
        ? JSON.parse(rows[0].cambios as string)
        : rows[0]?.cambios;

    expect(Object.keys(cambios)).toEqual(['precio']);
    expect(cambios.precio).toEqual({ antes: 10, despues: 12 });
  });

  it('registra el login de un ADMIN pero no el de un CLIENT', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ username: admin.username, password: admin.password });

    const [logsAdmin] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM admin_logs
        WHERE accion = 'LOGIN' AND admin_username = ?`,
      [admin.username]
    );
    expect(Number(logsAdmin[0]?.total)).toBeGreaterThan(0);

    const [logsCliente] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM admin_logs WHERE admin_username = ?`,
      [cliente.username]
    );
    expect(Number(logsCliente[0]?.total)).toBe(0);
  });

  it('no registra las lecturas, solo las escrituras', async () => {
    const [antes] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM admin_logs'
    );

    for (let i = 0; i < 5; i++) {
      await request(app)
        .get('/api/admin/productos')
        .set('Authorization', `Bearer ${tokenAdmin}`);
    }

    const [despues] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM admin_logs'
    );
    expect(Number(despues[0]?.total)).toBe(Number(antes[0]?.total));
  });

  it('existe el evento de purga con retención de 180 días', async () => {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT EVENT_NAME, STATUS FROM information_schema.EVENTS
        WHERE EVENT_SCHEMA = DATABASE() AND EVENT_NAME = 'ev_purga_admin_logs'`
    );
    expect(rows[0]?.STATUS).toBe('ENABLED');
  });
});

describe('área de cliente', () => {
  it('devuelve membresía, asistencias y promociones', async () => {
    const res = await request(app)
      .get('/api/cliente/panel')
      .set('Authorization', `Bearer ${tokenCliente}`);

    expect(res.status).toBe(200);
    expect(res.body.membresia).toMatchObject({
      plan: expect.any(String),
      estado: expect.any(String),
      fechaInicio: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      fechaProximoPago: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
    expect(Array.isArray(res.body.asistencias)).toBe(true);
    expect(Array.isArray(res.body.promociones)).toBe(true);
  });

  it('exige sesión', async () => {
    expect((await request(app).get('/api/cliente/panel')).status).toBe(401);
  });

  it('permite registrar una asistencia', async () => {
    const antes = await request(app)
      .get('/api/cliente/panel')
      .set('Authorization', `Bearer ${tokenCliente}`);

    const res = await request(app)
      .post('/api/cliente/asistencias')
      .set('Authorization', `Bearer ${tokenCliente}`);

    expect(res.status).toBe(201);
    expect(res.body.resumen.totalMes).toBe(
      antes.body.resumen.totalMes + 1
    );
  });
});

describe('seed del administrador inicial', () => {
  it('crea el usuario si no existe y luego es idempotente', async () => {
    const { seedAdmin } = await import('../../src/db/seed.js');
    const usuarioSeed = `${PREFIJO}seed`;

    process.env.ADMIN_USERNAME = usuarioSeed;
    process.env.ADMIN_PASSWORD = 'Password_123';
    vi.resetModules();
    const { seedAdmin: sembrar } = await import('../../src/db/seed.js');
    expect(typeof seedAdmin).toBe('function');

    const primera = await sembrar({ verbose: false });
    expect(primera.accion).toBe('creado');

    const segunda = await sembrar({ verbose: false });
    expect(segunda.accion).toBe('sin-cambios');
    expect(segunda.id).toBe(primera.id);

    // Se ha creado con rol ADMIN y puede iniciar sesión.
    const login = await request(app)
      .post('/api/auth/login')
      .send({ username: usuarioSeed, password: 'Password_123' });

    expect(login.status).toBe(200);
    expect(login.body.user.rol).toBe('ADMIN');

    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;
    vi.resetModules();
  });
});

describe('endpoints públicos', () => {
  it('devuelven promociones y productos sin token', async () => {
    const promos = await request(app).get('/api/publico/promociones');
    const productos = await request(app).get('/api/publico/productos');

    expect(promos.status).toBe(200);
    expect(productos.status).toBe(200);
    expect(Array.isArray(promos.body.promociones)).toBe(true);
  });

  it('solo muestran promociones vigentes', async () => {
    const hoy = new Date().toISOString().slice(0, 10);
    const res = await request(app).get('/api/publico/promociones');

    for (const promo of res.body.promociones) {
      expect(promo.activa).toBe(true);
      expect(promo.fechaInicio <= hoy).toBe(true);
      expect(promo.fechaFin >= hoy).toBe(true);
    }
  });
});
