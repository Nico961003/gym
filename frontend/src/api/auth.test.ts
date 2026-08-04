import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchProfile, login, register } from './auth';

function respuesta(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

const usuario = { id: 1, username: 'demo', rol: 'CLIENT' };

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ user: usuario, token: 't' }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function llamada() {
  return fetchMock.mock.calls[0] as [string, RequestInit];
}

describe('login', () => {
  it('hace POST a /auth/login con las credenciales', async () => {
    await login({ username: 'demo', password: 'Password1!' });

    const [url, init] = llamada();
    expect(url).toContain('/auth/login');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual({
      username: 'demo',
      password: 'Password1!',
    });
  });

  it('devuelve usuario y token', async () => {
    await expect(login({ username: 'demo', password: 'x' })).resolves.toEqual({
      user: usuario,
      token: 't',
    });
  });

  it('no manda cabecera Authorization', async () => {
    await login({ username: 'demo', password: 'x' });
    expect(llamada()[1].headers).not.toHaveProperty('Authorization');
  });
});

describe('register', () => {
  it('hace POST a /auth/register con todos los campos', async () => {
    const alta = {
      username: 'nuevo',
      nombre: 'Ana',
      apellido: 'Ruiz',
      edad: 28,
      peso: 60.5,
      estatura: 1.65,
      password: 'Password1!',
    };

    await register(alta);

    const [url, init] = llamada();
    expect(url).toContain('/auth/register');
    expect(JSON.parse(init.body as string)).toEqual(alta);
  });
});

describe('fetchProfile', () => {
  it('hace GET a /auth/me con el token', async () => {
    fetchMock.mockResolvedValue(respuesta({ user: usuario }));

    await fetchProfile('abc123');

    const [url, init] = llamada();
    expect(url).toContain('/auth/me');
    expect(init.method).toBe('GET');
    expect(init.headers).toMatchObject({ Authorization: 'Bearer abc123' });
  });

  it('devuelve el usuario desempaquetado, no el sobre', async () => {
    fetchMock.mockResolvedValue(respuesta({ user: usuario }));
    await expect(fetchProfile('t')).resolves.toEqual(usuario);
  });

  it('propaga el error si el token no vale', async () => {
    fetchMock.mockResolvedValue(respuesta({ error: 'Token inválido' }, 401));
    await expect(fetchProfile('malo')).rejects.toMatchObject({ status: 401 });
  });
});
