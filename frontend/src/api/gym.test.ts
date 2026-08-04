import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  actualizarProducto,
  actualizarPromocion,
  actualizarUsuario,
  borrarProducto,
  borrarPromocion,
  borrarUsuario,
  crearProducto,
  crearPromocion,
  fetchLogs,
  fetchPanelCliente,
  fetchProductos,
  fetchProductosPublicos,
  fetchPromociones,
  fetchPromocionesPublicas,
  fetchUsuarios,
  registrarAsistencia,
} from './gym';

function respuesta(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({}));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function llamada() {
  return fetchMock.mock.calls[0] as [string, RequestInit];
}

const TOKEN = 'tok';
const promo = { id: 1, titulo: 'Promo' };
const producto = { id: 1, nombre: 'Proteína' };

describe('endpoints públicos', () => {
  it('fetchPromocionesPublicas no manda token y desempaqueta la lista', async () => {
    fetchMock.mockResolvedValue(respuesta({ promociones: [promo] }));

    await expect(fetchPromocionesPublicas()).resolves.toEqual([promo]);

    const [url, init] = llamada();
    expect(url).toContain('/publico/promociones');
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('fetchProductosPublicos apunta a /publico/productos', async () => {
    fetchMock.mockResolvedValue(respuesta({ productos: [producto] }));
    await expect(fetchProductosPublicos()).resolves.toEqual([producto]);
    expect(llamada()[0]).toContain('/publico/productos');
  });
});

describe('endpoints de cliente', () => {
  it('fetchPanelCliente manda el token', async () => {
    fetchMock.mockResolvedValue(respuesta({ membresia: null }));
    await fetchPanelCliente(TOKEN);

    const [url, init] = llamada();
    expect(url).toContain('/cliente/panel');
    expect(init.headers).toMatchObject({ Authorization: `Bearer ${TOKEN}` });
  });

  it('registrarAsistencia hace POST', async () => {
    fetchMock.mockResolvedValue(respuesta({ asistencias: [], resumen: {} }));
    await registrarAsistencia(TOKEN);

    const [url, init] = llamada();
    expect(url).toContain('/cliente/asistencias');
    expect(init.method).toBe('POST');
  });
});

describe('CRUD de promociones', () => {
  it('lista', async () => {
    fetchMock.mockResolvedValue(respuesta({ promociones: [promo] }));
    await expect(fetchPromociones(TOKEN)).resolves.toEqual([promo]);
    expect(llamada()[0]).toContain('/admin/promociones');
  });

  it('crea con POST', async () => {
    fetchMock.mockResolvedValue(respuesta({ promocion: promo }));
    await crearPromocion(TOKEN, { titulo: 'X' } as never);

    const [url, init] = llamada();
    expect(url).toMatch(/\/admin\/promociones$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({ titulo: 'X' });
  });

  it('actualiza con PUT y el id en la ruta', async () => {
    fetchMock.mockResolvedValue(respuesta({ promocion: promo }));
    await actualizarPromocion(TOKEN, 42, { titulo: 'X' } as never);

    const [url, init] = llamada();
    expect(url).toContain('/admin/promociones/42');
    expect(init.method).toBe('PUT');
  });

  it('borra con DELETE', async () => {
    fetchMock.mockResolvedValue(respuesta(undefined, 204));
    await borrarPromocion(TOKEN, 42);

    const [url, init] = llamada();
    expect(url).toContain('/admin/promociones/42');
    expect(init.method).toBe('DELETE');
  });
});

describe('CRUD de productos', () => {
  it('lista, crea, actualiza y borra en las rutas correctas', async () => {
    fetchMock.mockResolvedValue(respuesta({ productos: [producto] }));
    await fetchProductos(TOKEN);
    expect(llamada()[0]).toContain('/admin/productos');

    fetchMock.mockClear();
    fetchMock.mockResolvedValue(respuesta({ producto }));
    await crearProducto(TOKEN, { nombre: 'X' } as never);
    expect(llamada()[1].method).toBe('POST');

    fetchMock.mockClear();
    await actualizarProducto(TOKEN, 9, { nombre: 'X' } as never);
    expect(llamada()[0]).toContain('/admin/productos/9');
    expect(llamada()[1].method).toBe('PUT');

    fetchMock.mockClear();
    fetchMock.mockResolvedValue(respuesta(undefined, 204));
    await borrarProducto(TOKEN, 9);
    expect(llamada()[1].method).toBe('DELETE');
  });
});

describe('gestión de usuarios', () => {
  it('lista usuarios', async () => {
    fetchMock.mockResolvedValue(respuesta({ usuarios: [] }));
    await expect(fetchUsuarios(TOKEN)).resolves.toEqual([]);
    expect(llamada()[0]).toContain('/admin/usuarios');
  });

  it('actualiza con PUT', async () => {
    fetchMock.mockResolvedValue(respuesta({ usuario: { id: 2 } }));
    await actualizarUsuario(TOKEN, 2, { rol: 'ADMIN' } as never);

    const [url, init] = llamada();
    expect(url).toContain('/admin/usuarios/2');
    expect(init.method).toBe('PUT');
  });

  it('borra con DELETE', async () => {
    fetchMock.mockResolvedValue(respuesta(undefined, 204));
    await borrarUsuario(TOKEN, 2);
    expect(llamada()[1].method).toBe('DELETE');
  });
});

describe('registro de actividad', () => {
  it('sin filtro pide la ruta limpia', async () => {
    fetchMock.mockResolvedValue(respuesta({ logs: [], total: 0 }));
    await fetchLogs(TOKEN);
    expect(llamada()[0]).toMatch(/\/admin\/logs$/);
  });

  it('con filtro añade el parámetro entidad', async () => {
    fetchMock.mockResolvedValue(respuesta({ logs: [], total: 0 }));
    await fetchLogs(TOKEN, 'USUARIO');
    expect(llamada()[0]).toContain('/admin/logs?entidad=USUARIO');
  });

  it('devuelve logs y total', async () => {
    fetchMock.mockResolvedValue(respuesta({ logs: [{ id: 1 }], total: 1 }));
    await expect(fetchLogs(TOKEN)).resolves.toEqual({
      logs: [{ id: 1 }],
      total: 1,
    });
  });
});
