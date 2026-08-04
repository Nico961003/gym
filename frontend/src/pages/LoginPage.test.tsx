import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockFetch,
  panelVacio,
  renderRuta,
  usuarioAdmin,
  usuarioCliente,
} from '../test/utils';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('formulario', () => {
  it('pide usuario y contraseña', async () => {
    renderRuta('/acceder');
    expect(await screen.findByLabelText(/usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it('la contraseña va en un campo de tipo password', async () => {
    renderRuta('/acceder');
    expect(await screen.findByLabelText(/contraseña/i)).toHaveAttribute(
      'type',
      'password'
    );
  });

  it('usa los autocompletados que espera el navegador', async () => {
    renderRuta('/acceder');
    expect(await screen.findByLabelText(/usuario/i)).toHaveAttribute(
      'autocomplete',
      'username'
    );
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute(
      'autocomplete',
      'current-password'
    );
  });

  it('ofrece un enlace para crear cuenta', async () => {
    renderRuta('/acceder');
    expect(await screen.findByRole('link', { name: /crea tu cuenta/i }))
      .toHaveAttribute('href', '/registro');
  });
});

describe('envío', () => {
  it('manda las credenciales a /auth/login', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch([
      {
        metodo: 'POST',
        patron: '/auth/login',
        body: { user: usuarioCliente, token: 't' },
      },
      { patron: '/cliente/panel', body: panelVacio },
    ]);

    renderRuta('/acceder');

    await user.type(await screen.findByLabelText(/usuario/i), 'demo');
    await user.type(screen.getByLabelText(/contraseña/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /^acceder$/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/auth/login');
    expect(JSON.parse(init.body as string)).toEqual({
      username: 'demo',
      password: 'Password1!',
    });
  });

  it('un CLIENT aterriza en su cuenta', async () => {
    const user = userEvent.setup();
    mockFetch([
      {
        metodo: 'POST',
        patron: '/auth/login',
        body: { user: usuarioCliente, token: 't' },
      },
      { patron: '/cliente/panel', body: panelVacio },
    ]);

    renderRuta('/acceder');

    await user.type(await screen.findByLabelText(/usuario/i), 'demo');
    await user.type(screen.getByLabelText(/contraseña/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /^acceder$/i }));

    expect(await screen.findByText(/hola, ana/i)).toBeInTheDocument();
  });

  it('un ADMIN aterriza en el panel de administración', async () => {
    const user = userEvent.setup();
    mockFetch([
      {
        metodo: 'POST',
        patron: '/auth/login',
        body: { user: usuarioAdmin, token: 't' },
      },
      { patron: '/admin/promociones', body: { promociones: [] } },
    ]);

    renderRuta('/acceder');

    await user.type(await screen.findByLabelText(/usuario/i), 'admin');
    await user.type(screen.getByLabelText(/contraseña/i), 'User_123');
    await user.click(screen.getByRole('button', { name: /^acceder$/i }));

    expect(await screen.findByText(/panel de control/i)).toBeInTheDocument();
  });

  it('vuelve a la página que se pedía antes del desvío', async () => {
    const user = userEvent.setup();
    mockFetch([
      {
        metodo: 'POST',
        patron: '/auth/login',
        body: { user: usuarioCliente, token: 't' },
      },
      { patron: '/cliente/panel', body: panelVacio },
    ]);

    renderRuta('/mi-cuenta');

    await user.type(await screen.findByLabelText(/usuario/i), 'demo');
    await user.type(screen.getByLabelText(/contraseña/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /^acceder$/i }));

    expect(await screen.findByText(/hola, ana/i)).toBeInTheDocument();
  });
});

describe('errores', () => {
  it('muestra el mensaje del servidor con credenciales incorrectas', async () => {
    const user = userEvent.setup();
    mockFetch([
      {
        metodo: 'POST',
        patron: '/auth/login',
        status: 401,
        body: { error: 'Credenciales inválidas' },
      },
    ]);

    renderRuta('/acceder');

    await user.type(await screen.findByLabelText(/usuario/i), 'demo');
    await user.type(screen.getByLabelText(/contraseña/i), 'mala');
    await user.click(screen.getByRole('button', { name: /^acceder$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /credenciales inválidas/i
    );
  });

  it('avisa si el backend no responde', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      })
    );

    renderRuta('/acceder');

    await user.type(await screen.findByLabelText(/usuario/i), 'demo');
    await user.type(screen.getByLabelText(/contraseña/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /^acceder$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /no se pudo conectar/i
    );
  });

  it('deshabilita el botón mientras se envía', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));

    renderRuta('/acceder');

    await user.type(await screen.findByLabelText(/usuario/i), 'demo');
    await user.type(screen.getByLabelText(/contraseña/i), 'Password1!');
    await user.click(screen.getByRole('button', { name: /^acceder$/i }));

    expect(await screen.findByRole('button', { name: /entrando/i }))
      .toBeDisabled();
  });
});
