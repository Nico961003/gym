import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, apiRequest } from './client';

function respuesta(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as Response;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ApiError', () => {
  it('guarda estado, mensaje y detalles', () => {
    const error = new ApiError(400, 'Inválido', [
      { campo: 'password', mensaje: 'Muy corta' },
    ]);

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.status).toBe(400);
    expect(error.details).toHaveLength(1);
  });

  it('messages devuelve los detalles cuando los hay', () => {
    const error = new ApiError(400, 'Inválido', [
      { campo: 'password', mensaje: 'Muy corta' },
      { campo: 'edad', mensaje: 'Fuera de rango' },
    ]);
    expect(error.messages).toEqual(['Muy corta', 'Fuera de rango']);
  });

  it('messages cae al mensaje general si no hay detalles', () => {
    expect(new ApiError(401, 'Credenciales inválidas').messages).toEqual([
      'Credenciales inválidas',
    ]);
  });
});

describe('apiRequest', () => {
  it('hace GET sin cuerpo ni Content-Type', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/publico/promociones');

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/publico/promociones');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
    expect(init.headers).not.toHaveProperty('Content-Type');
  });

  it('serializa el cuerpo y añade Content-Type en POST', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/auth/login', {
      method: 'POST',
      body: { username: 'demo' },
    });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"username":"demo"}');
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('añade la cabecera Authorization cuando hay token', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/auth/me', { token: 'abc123' });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toMatchObject({ Authorization: 'Bearer abc123' });
  });

  it('no añade Authorization si el token es null', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/publico/productos', { token: null });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).not.toHaveProperty('Authorization');
  });

  it('devuelve el JSON ya parseado', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ productos: [1, 2] })));
    await expect(apiRequest('/publico/productos')).resolves.toEqual({
      productos: [1, 2],
    });
  });

  it('devuelve null cuando la respuesta viene vacía (204)', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, _init?: RequestInit) => respuesta(undefined, 204)));
    await expect(apiRequest('/admin/productos/1', { method: 'DELETE' }))
      .resolves.toBeNull();
  });

  it('lanza ApiError con el mensaje del servidor', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ error: 'Credenciales inválidas' }, 401))
    );

    await expect(apiRequest('/auth/login', { method: 'POST' })).rejects.toThrow(
      ApiError
    );
    await expect(
      apiRequest('/auth/login', { method: 'POST' })
    ).rejects.toMatchObject({ status: 401, message: 'Credenciales inválidas' });
  });

  it('conserva los detalles de validación del backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        respuesta(
          {
            error: 'Los datos enviados no son válidos',
            detalles: [{ campo: 'password', mensaje: 'Falta una mayúscula' }],
          },
          400
        )
      )
    );

    const error = await apiRequest('/auth/register', { method: 'POST' }).catch(
      (e: ApiError) => e
    );

    expect((error as ApiError).messages).toEqual(['Falta una mayúscula']);
  });

  it('usa un mensaje por defecto si el error no trae texto', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, _init?: RequestInit) => respuesta({}, 500)));
    await expect(apiRequest('/x')).rejects.toMatchObject({
      message: 'Error 500',
    });
  });

  it('convierte un fallo de red en ApiError con status 0', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      })
    );

    const error = await apiRequest('/x').catch((e: ApiError) => e);
    expect((error as ApiError).status).toBe(0);
    expect((error as ApiError).message).toMatch(/no se pudo conectar/i);
  });

  it('propaga la señal de cancelación', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await apiRequest('/x', { signal: controller.signal });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });
});
