import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  iniciarSesion,
  mockFetch,
  renderRuta,
  usuarioAdmin,
} from '../../test/utils';

const sesionAdmin = { patron: '/auth/me', body: { user: usuarioAdmin } };

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  iniciarSesion();
  mockFetch([
    sesionAdmin,
    { patron: '/admin/promociones', body: { promociones: [] } },
    { patron: '/admin/productos', body: { productos: [] } },
    { patron: '/admin/usuarios', body: { usuarios: [] } },
    { patron: '/admin/logs', body: { total: 0, logs: [] } },
  ]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('AdminLayout', () => {
  it('identifica al administrador de la sesión', async () => {
    renderRuta('/admin/promociones');

    expect(await screen.findByText(/panel de control/i)).toBeInTheDocument();
    expect(screen.getByText(/Admin Rodriguez/)).toBeInTheDocument();
    expect(screen.getByText('ADMIN')).toBeInTheDocument();
  });

  /**
   * El pie repite «Promociones», «Tarifas», etc., así que las pestañas se
   * buscan siempre dentro de su propia barra de navegación.
   */
  async function pestanas() {
    const primera = await screen.findByRole('link', { name: 'Productos' });
    return within(primera.closest('nav') as HTMLElement);
  }

  it('ofrece las cuatro secciones', async () => {
    renderRuta('/admin/promociones');
    const nav = await pestanas();

    for (const seccion of [
      'Promociones',
      'Productos',
      'Usuarios',
      'Registro de actividad',
    ]) {
      expect(nav.getByRole('link', { name: seccion })).toBeInTheDocument();
    }
  });

  it('marca la pestaña activa', async () => {
    renderRuta('/admin/productos');
    const nav = await pestanas();

    expect(nav.getByRole('link', { name: 'Productos' })).toHaveClass(
      'is-active'
    );
    expect(nav.getByRole('link', { name: 'Promociones' })).not.toHaveClass(
      'is-active'
    );
  });

  it('permite navegar entre secciones', async () => {
    const user = userEvent.setup();
    renderRuta('/admin/promociones');
    const nav = await pestanas();

    await user.click(nav.getByRole('link', { name: 'Usuarios' }));
    expect(
      await screen.findByRole('heading', { name: /usuarios \(0\)/i })
    ).toBeInTheDocument();
  });

  it('/admin redirige a la pestaña de promociones', async () => {
    renderRuta('/admin');
    expect(
      await screen.findByRole('heading', { name: /promociones \(0\)/i })
    ).toBeInTheDocument();
  });
});
