import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { AdminLog } from '../../api/types';
import LogsAdmin from './LogsAdmin';
import {
  iniciarSesion,
  mockFetch,
  renderConSesion,
  usuarioAdmin,
} from '../../test/utils';

const sesionAdmin = { patron: '/auth/me', body: { user: usuarioAdmin } };

const logEdicion: AdminLog = {
  id: 1,
  adminId: 3,
  adminUsername: 'admin',
  accion: 'ACTUALIZAR',
  entidad: 'PRODUCTO',
  entidadId: 7,
  cambios: { precio: { antes: 10, despues: 12 } },
  ip: '127.0.0.1',
  createdAt: '2026-08-04T10:00:00.000Z',
};

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  iniciarSesion();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('listado', () => {
  it('muestra el movimiento con su acción y entidad', async () => {
    mockFetch([
      sesionAdmin,
      { patron: '/admin/logs', body: { total: 1, logs: [logEdicion] } },
    ]);

    renderConSesion(<LogsAdmin />, usuarioAdmin);

    expect(await screen.findByText('ACTUALIZAR')).toBeInTheDocument();
    expect(screen.getByText(/PRODUCTO/)).toBeInTheDocument();
    expect(screen.getByText(/#7/)).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();
  });

  it('resume el diff en una línea legible', async () => {
    mockFetch([
      sesionAdmin,
      { patron: '/admin/logs', body: { total: 1, logs: [logEdicion] } },
    ]);

    renderConSesion(<LogsAdmin />, usuarioAdmin);
    expect(await screen.findByText(/precio: 10 → 12/)).toBeInTheDocument();
  });

  it('en un alta solo muestra el valor nuevo', async () => {
    mockFetch([
      sesionAdmin,
      {
        patron: '/admin/logs',
        body: {
          total: 1,
          logs: [
            {
              ...logEdicion,
              accion: 'CREAR',
              cambios: { nombre: { despues: 'Guantes' } },
            },
          ],
        },
      },
    ]);

    renderConSesion(<LogsAdmin />, usuarioAdmin);
    expect(await screen.findByText(/nombre: "Guantes"/)).toBeInTheDocument();
  });

  it('muestra un guion cuando no hay cambios (por ejemplo, un login)', async () => {
    mockFetch([
      sesionAdmin,
      {
        patron: '/admin/logs',
        body: {
          total: 1,
          logs: [
            {
              ...logEdicion,
              accion: 'LOGIN',
              entidad: 'SESION',
              cambios: null,
            },
          ],
        },
      },
    ]);

    renderConSesion(<LogsAdmin />, usuarioAdmin);
    expect(await screen.findByText('LOGIN')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('muestra la IP y el total, y explica la retención', async () => {
    mockFetch([
      sesionAdmin,
      { patron: '/admin/logs', body: { total: 42, logs: [logEdicion] } },
    ]);

    renderConSesion(<LogsAdmin />, usuarioAdmin);

    expect(await screen.findByText('127.0.0.1')).toBeInTheDocument();
    expect(screen.getByText(/42 movimientos registrados/)).toBeInTheDocument();
    expect(screen.getByText(/se conservan 180 días/i)).toBeInTheDocument();
  });

  it('avisa cuando no hay movimientos', async () => {
    mockFetch([
      sesionAdmin,
      { patron: '/admin/logs', body: { total: 0, logs: [] } },
    ]);

    renderConSesion(<LogsAdmin />, usuarioAdmin);
    expect(
      await screen.findByText(/no hay movimientos registrados/i)
    ).toBeInTheDocument();
  });
});

describe('filtros', () => {
  it('añade el parámetro entidad al filtrar', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch([
      sesionAdmin,
      { patron: '/admin/logs', body: { total: 0, logs: [] } },
    ]);

    renderConSesion(<LogsAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /^usuarios$/i }));

    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(([url]) =>
          (url as string).includes('entidad=USUARIO')
        )
      ).toBe(true)
    );
  });

  it('«Todo» no añade filtro', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch([
      sesionAdmin,
      { patron: '/admin/logs', body: { total: 0, logs: [] } },
    ]);

    renderConSesion(<LogsAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /^usuarios$/i }));
    await user.click(screen.getByRole('button', { name: /^todo$/i }));

    await waitFor(() => {
      const ultima = fetchMock.mock.calls.at(-1)?.[0] as string;
      expect(ultima).not.toContain('entidad=');
    });
  });
});

describe('errores', () => {
  it('avisa si no se puede cargar el registro', async () => {
    mockFetch([
      sesionAdmin,
      { patron: '/admin/logs', status: 500, body: { error: 'boom' } },
    ]);

    renderConSesion(<LogsAdmin />, usuarioAdmin);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
