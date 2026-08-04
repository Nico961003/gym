import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import UsuariosAdmin from './UsuariosAdmin';
import {
  iniciarSesion,
  llamadaCon,
  mockFetch,
  renderConSesion,
  usuarioAdmin,
  usuarioCliente,
} from '../../test/utils';

const sesionAdmin = { patron: '/auth/me', body: { user: usuarioAdmin } };
const listado = {
  patron: '/admin/usuarios',
  body: { usuarios: [usuarioAdmin, usuarioCliente] },
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  iniciarSesion();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function fila(nombre: string): HTMLElement {
  return screen.getByText(nombre).closest('tr') as HTMLElement;
}

describe('listado', () => {
  it('muestra a cada usuario con su rol', async () => {
    mockFetch([sesionAdmin, listado]);
    renderConSesion(<UsuariosAdmin />, usuarioAdmin);

    await screen.findByText('admin');
    // "ADMIN" aparece también en la cabecera del panel: se acota a la fila.
    expect(within(fila('admin')).getByText('ADMIN')).toBeInTheDocument();
    expect(within(fila('demo')).getByText('CLIENT')).toBeInTheDocument();
  });

  it('resume cuántos son administradores y cuántos clientes', async () => {
    mockFetch([sesionAdmin, listado]);
    renderConSesion(<UsuariosAdmin />, usuarioAdmin);

    expect(
      await screen.findByText(/1 administrador\(es\) · 1 cliente\(s\)/i)
    ).toBeInTheDocument();
  });

  it('señala cuál es la cuenta propia', async () => {
    mockFetch([sesionAdmin, listado]);
    renderConSesion(<UsuariosAdmin />, usuarioAdmin);

    await screen.findByText('admin');
    expect(within(fila('admin')).getByText('Tú')).toBeInTheDocument();
  });

  it('muestra los datos físicos con sus unidades', async () => {
    mockFetch([sesionAdmin, listado]);
    renderConSesion(<UsuariosAdmin />, usuarioAdmin);

    await screen.findByText('demo');
    expect(within(fila('demo')).getByText('60.5 kg')).toBeInTheDocument();
    expect(within(fila('demo')).getByText('1.65 m')).toBeInTheDocument();
  });

  it('nunca expone hashes', async () => {
    mockFetch([sesionAdmin, listado]);
    const { container } = renderConSesion(<UsuariosAdmin />, usuarioAdmin);

    await screen.findByText('demo');
    expect(container.innerHTML).not.toContain('$2b$');
    expect(container.innerHTML).not.toContain('password');
  });
});

describe('edición', () => {
  it('precarga los datos del usuario elegido', async () => {
    const user = userEvent.setup();
    mockFetch([sesionAdmin, { patron: '/admin/usuarios', body: { usuarios: [usuarioCliente] } }]);

    renderConSesion(<UsuariosAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /editar/i }));

    expect(screen.getByLabelText(/^nombre$/i)).toHaveValue(
      usuarioCliente.nombre
    );
    expect(screen.getByLabelText(/^rol$/i)).toHaveValue('CLIENT');
  });

  it('permite promover a un cliente a administrador', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch([
      sesionAdmin,
      {
        metodo: 'PUT',
        patron: '/admin/usuarios/2',
        body: { usuario: { ...usuarioCliente, rol: 'ADMIN' } },
      },
      { patron: '/admin/usuarios', body: { usuarios: [usuarioCliente] } },
    ]);

    renderConSesion(<UsuariosAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /editar/i }));
    await user.selectOptions(screen.getByLabelText(/^rol$/i), 'ADMIN');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => expect(llamadaCon(fetchMock, 'PUT')).toBeDefined());
    expect(
      JSON.parse(llamadaCon(fetchMock, 'PUT')![1].body as string).rol
    ).toBe('ADMIN');
  });

  it('muestra el error si el servidor rechaza el cambio', async () => {
    const user = userEvent.setup();
    mockFetch([
      sesionAdmin,
      {
        metodo: 'PUT',
        patron: '/admin/usuarios/2',
        status: 409,
        body: { error: 'No puedes quitar el rol al último administrador' },
      },
      { patron: '/admin/usuarios', body: { usuarios: [usuarioCliente] } },
    ]);

    renderConSesion(<UsuariosAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /editar/i }));
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /último administrador/i
    );
  });
});

describe('borrado', () => {
  it('impide borrarse a uno mismo', async () => {
    mockFetch([sesionAdmin, listado]);
    renderConSesion(<UsuariosAdmin />, usuarioAdmin);

    await screen.findByText('admin');
    const boton = within(fila('admin')).getByRole('button', { name: /borrar/i });

    expect(boton).toBeDisabled();
    expect(boton).toHaveAttribute('title', 'No puedes borrar tu propia cuenta');
  });

  it('borra a otro usuario tras confirmar', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = mockFetch([
      sesionAdmin,
      {
        metodo: 'DELETE',
        patron: '/admin/usuarios/2',
        status: 204,
        body: undefined,
      },
      listado,
    ]);

    renderConSesion(<UsuariosAdmin />, usuarioAdmin);
    await screen.findByText('demo');
    await user.click(
      within(fila('demo')).getByRole('button', { name: /borrar/i })
    );

    await waitFor(() => expect(llamadaCon(fetchMock, 'DELETE')).toBeDefined());
    expect(llamadaCon(fetchMock, 'DELETE')![0]).toContain('/admin/usuarios/2');
  });
});
