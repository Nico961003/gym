import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  iniciarSesion,
  mockFetch,
  panelVacio,
  renderRuta,
  usuarioAdmin,
  usuarioCliente,
} from './test/utils';

/**
 * Este archivo cubre el ENRUTADO. El contenido de cada pantalla se prueba en
 * el test que acompaña a su componente.
 */

const promocionesVacias = {
  patron: '/publico/promociones',
  body: { promociones: [] },
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  mockFetch([promocionesVacias]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('rutas públicas', () => {
  it('«/» muestra la portada', async () => {
    const { container } = renderRuta('/');
    await waitFor(() =>
      expect(container.querySelector('#inicio')).toBeInTheDocument()
    );
  });

  it('«/acceder» muestra el formulario de acceso', async () => {
    renderRuta('/acceder');
    expect(
      await screen.findByRole('button', { name: /^acceder$/i })
    ).toBeInTheDocument();
  });

  it('«/registro» muestra el alta', async () => {
    renderRuta('/registro');
    expect(
      await screen.findByRole('button', { name: /crear cuenta/i })
    ).toBeInTheDocument();
  });

  it('una ruta inexistente vuelve a la portada', async () => {
    const { container } = renderRuta('/esto-no-existe');
    await waitFor(() =>
      expect(container.querySelector('#inicio')).toBeInTheDocument()
    );
  });
});

describe('rutas con sesión', () => {
  it('sin sesión, «/mi-cuenta» desvía al acceso', async () => {
    renderRuta('/mi-cuenta');
    expect(
      await screen.findByRole('button', { name: /^acceder$/i })
    ).toBeInTheDocument();
  });

  it('con sesión, «/mi-cuenta» muestra el área de cliente', async () => {
    iniciarSesion();
    mockFetch([
      { patron: '/auth/me', body: { user: usuarioCliente } },
      { patron: '/cliente/panel', body: panelVacio },
    ]);

    renderRuta('/mi-cuenta');
    expect(await screen.findByText(/hola, ana/i)).toBeInTheDocument();
  });
});

describe('rutas de administración', () => {
  it('sin sesión desvían al acceso', async () => {
    renderRuta('/admin/promociones');
    expect(
      await screen.findByRole('button', { name: /^acceder$/i })
    ).toBeInTheDocument();
  });

  it('un CLIENT acaba en la portada', async () => {
    iniciarSesion();
    mockFetch([
      { patron: '/auth/me', body: { user: usuarioCliente } },
      promocionesVacias,
    ]);

    const { container } = renderRuta('/admin/promociones');

    await waitFor(() =>
      expect(container.querySelector('#inicio')).toBeInTheDocument()
    );
    expect(screen.queryByText(/panel de control/i)).not.toBeInTheDocument();
  });

  it('un ADMIN entra en el panel', async () => {
    iniciarSesion();
    mockFetch([
      { patron: '/auth/me', body: { user: usuarioAdmin } },
      { patron: '/admin/promociones', body: { promociones: [] } },
    ]);

    renderRuta('/admin/promociones');
    expect(await screen.findByText(/panel de control/i)).toBeInTheDocument();
  });

  it('las cuatro subrutas del panel resuelven', async () => {
    iniciarSesion();

    // Se busca el encabezado del contenido: el nombre de la sección aparece
    // también en la pestaña y en el pie.
    const rutas: [string, RegExp][] = [
      ['/admin/promociones', /^promociones \(0\)$/i],
      ['/admin/productos', /^productos \(0\)$/i],
      ['/admin/usuarios', /^usuarios \(0\)$/i],
      ['/admin/logs', /^registro de actividad$/i],
    ];

    for (const [ruta, texto] of rutas) {
      mockFetch([
        { patron: '/auth/me', body: { user: usuarioAdmin } },
        { patron: '/admin/promociones', body: { promociones: [] } },
        { patron: '/admin/productos', body: { productos: [] } },
        { patron: '/admin/usuarios', body: { usuarios: [] } },
        { patron: '/admin/logs', body: { total: 0, logs: [] } },
      ]);

      const { unmount } = renderRuta(ruta);
      expect(
        await screen.findByRole('heading', { name: texto }),
        ruta
      ).toBeInTheDocument();
      unmount();
      localStorage.clear();
      iniciarSesion();
    }
  });
});

describe('sesión persistida', () => {
  it('descarta un token caducado al arrancar', async () => {
    iniciarSesion();
    mockFetch([
      { patron: '/auth/me', status: 401, body: { error: 'Token inválido' } },
      promocionesVacias,
    ]);

    renderRuta('/');

    await waitFor(() =>
      expect(localStorage.getItem('rg.auth.token')).toBeNull()
    );
  });
});
