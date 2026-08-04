import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Promocion } from '../../api/types';
import PromocionesAdmin from './PromocionesAdmin';
import {
  iniciarSesion,
  llamadaCon,
  mockFetch,
  promocionDemo,
  renderConSesion,
  usuarioAdmin,
} from '../../test/utils';

const inactiva: Promocion = {
  ...promocionDemo,
  id: 2,
  titulo: 'Descuento estudiantes',
  tipo: 'PORCENTAJE',
  valor: 20,
  codigo: 'ESTUDIA20',
  destacada: false,
  activa: false,
};

const sesionAdmin = { patron: '/auth/me', body: { user: usuarioAdmin } };

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  iniciarSesion();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('listado', () => {
  it('muestra las promociones con su estado', async () => {
    mockFetch([
      sesionAdmin,
      {
        patron: '/admin/promociones',
        body: { promociones: [promocionDemo, inactiva] },
      },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);

    expect(await screen.findByText(promocionDemo.titulo)).toBeInTheDocument();
    expect(screen.getByText(inactiva.titulo)).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
    expect(screen.getByText('Inactiva')).toBeInTheDocument();
  });

  it('marca las destacadas', async () => {
    mockFetch([
      sesionAdmin,
      { patron: '/admin/promociones', body: { promociones: [promocionDemo] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);
    expect(await screen.findByText('Destacada')).toBeInTheDocument();
  });

  it('avisa cuando no hay ninguna', async () => {
    mockFetch([
      sesionAdmin,
      { patron: '/admin/promociones', body: { promociones: [] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);
    expect(
      await screen.findByText(/todavía no hay promociones/i)
    ).toBeInTheDocument();
  });
});

describe('alta', () => {
  it('envía la promoción nueva con POST', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch([
      sesionAdmin,
      {
        metodo: 'POST',
        patron: '/admin/promociones',
        status: 201,
        body: { promocion: promocionDemo },
      },
      { patron: '/admin/promociones', body: { promociones: [] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);

    await user.click(
      await screen.findByRole('button', { name: /nueva promoción/i })
    );
    await user.type(screen.getByLabelText(/^título$/i), 'Promo de test');
    await user.type(
      screen.getByLabelText(/descripción/i),
      'Descripción suficientemente larga para el validador.'
    );
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => expect(llamadaCon(fetchMock, 'POST')).toBeDefined());
    const enviado = JSON.parse(
      llamadaCon(fetchMock, 'POST')![1].body as string
    );
    expect(enviado.titulo).toBe('Promo de test');
    expect(enviado.tipo).toBe('PORCENTAJE');
    expect(enviado.activa).toBe(true);
  });

  it('el formulario nace con fechas y tipo por defecto', async () => {
    const user = userEvent.setup();
    mockFetch([
      sesionAdmin,
      { patron: '/admin/promociones', body: { promociones: [] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);
    await user.click(
      await screen.findByRole('button', { name: /nueva promoción/i })
    );

    expect(screen.getByLabelText(/^desde$/i)).toHaveValue(
      new Date().toISOString().slice(0, 10)
    );
    expect(screen.getByLabelText(/^tipo$/i)).toHaveValue('PORCENTAJE');
  });

  it('la ayuda del campo valor cambia con el tipo', async () => {
    const user = userEvent.setup();
    mockFetch([
      sesionAdmin,
      { patron: '/admin/promociones', body: { promociones: [] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);
    await user.click(
      await screen.findByRole('button', { name: /nueva promoción/i })
    );

    expect(screen.getByText(/% de descuento/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/^tipo$/i), 'MESES_GRATIS');
    expect(screen.getByText(/nº de meses/i)).toBeInTheDocument();
  });
});

describe('edición', () => {
  it('precarga el formulario con los datos actuales', async () => {
    const user = userEvent.setup();
    mockFetch([
      sesionAdmin,
      { patron: '/admin/promociones', body: { promociones: [promocionDemo] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /editar/i }));

    expect(screen.getByLabelText(/^título$/i)).toHaveValue(promocionDemo.titulo);
    expect(screen.getByLabelText(/^valor$/i)).toHaveValue(promocionDemo.valor);
    expect(screen.getByLabelText(/^código/i)).toHaveValue(promocionDemo.codigo);
  });

  it('guarda con PUT sobre el id correspondiente', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch([
      sesionAdmin,
      {
        metodo: 'PUT',
        patron: '/admin/promociones/1',
        body: { promocion: promocionDemo },
      },
      { patron: '/admin/promociones', body: { promociones: [promocionDemo] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /editar/i }));
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => expect(llamadaCon(fetchMock, 'PUT')).toBeDefined());
    expect(llamadaCon(fetchMock, 'PUT')![0]).toContain('/admin/promociones/1');
  });
});

describe('validación del servidor', () => {
  it('muestra los errores dentro del diálogo', async () => {
    const user = userEvent.setup();
    mockFetch([
      sesionAdmin,
      {
        metodo: 'POST',
        patron: '/admin/promociones',
        status: 400,
        body: {
          error: 'Los datos enviados no son válidos',
          detalles: [
            {
              campo: 'fechaFin',
              mensaje: 'La fecha de fin no puede ser anterior a la de inicio',
            },
          ],
        },
      },
      { patron: '/admin/promociones', body: { promociones: [] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);
    await user.click(
      await screen.findByRole('button', { name: /nueva promoción/i })
    );
    await user.type(screen.getByLabelText(/^título$/i), 'X');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /no puede ser anterior/i
    );
    // El diálogo sigue abierto para poder corregir.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});

describe('borrado', () => {
  it('pide confirmación y borra', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = mockFetch([
      sesionAdmin,
      {
        metodo: 'DELETE',
        patron: '/admin/promociones/1',
        status: 204,
        body: undefined,
      },
      { patron: '/admin/promociones', body: { promociones: [promocionDemo] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /borrar/i }));

    await waitFor(() => expect(llamadaCon(fetchMock, 'DELETE')).toBeDefined());
  });

  it('no borra si se cancela', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fetchMock = mockFetch([
      sesionAdmin,
      { patron: '/admin/promociones', body: { promociones: [promocionDemo] } },
    ]);

    renderConSesion(<PromocionesAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /borrar/i }));

    expect(llamadaCon(fetchMock, 'DELETE')).toBeUndefined();
  });
});
