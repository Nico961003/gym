import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProductosAdmin from './ProductosAdmin';
import {
  iniciarSesion,
  llamadaCon,
  mockFetch,
  productoDemo,
  renderConSesion,
  usuarioAdmin,
} from '../../test/utils';

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
  it('muestra los cuatro campos del producto', async () => {
    mockFetch([
      sesionAdmin,
      { patron: '/admin/productos', body: { productos: [productoDemo] } },
    ]);

    renderConSesion(<ProductosAdmin />, usuarioAdmin);

    expect(await screen.findByText(productoDemo.nombre)).toBeInTheDocument();
    expect(screen.getByText('24.90 €')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText(productoDemo.fechaRegistro)).toBeInTheDocument();
  });

  it('marca como agotado el stock cero', async () => {
    mockFetch([
      sesionAdmin,
      {
        patron: '/admin/productos',
        body: { productos: [{ ...productoDemo, stock: 0 }] },
      },
    ]);

    renderConSesion(<ProductosAdmin />, usuarioAdmin);
    expect(await screen.findByText(/agotado/i)).toBeInTheDocument();
  });

  it('avisa del stock bajo', async () => {
    mockFetch([
      sesionAdmin,
      {
        patron: '/admin/productos',
        body: { productos: [{ ...productoDemo, stock: 5 }] },
      },
    ]);

    renderConSesion(<ProductosAdmin />, usuarioAdmin);
    expect(await screen.findByText('5')).toHaveClass('text-bg-warning');
  });

  it('calcula el valor del inventario', async () => {
    mockFetch([
      sesionAdmin,
      {
        patron: '/admin/productos',
        body: {
          productos: [
            { ...productoDemo, precio: 10, stock: 3 },
            { ...productoDemo, id: 2, precio: 5, stock: 2 },
          ],
        },
      },
    ]);

    renderConSesion(<ProductosAdmin />, usuarioAdmin);
    // 10*3 + 5*2 = 40
    expect(await screen.findByText(/40\.00 €/)).toBeInTheDocument();
  });

  it('avisa si la tienda está vacía', async () => {
    mockFetch([
      sesionAdmin,
      { patron: '/admin/productos', body: { productos: [] } },
    ]);

    renderConSesion(<ProductosAdmin />, usuarioAdmin);
    expect(await screen.findByText(/la tienda está vacía/i)).toBeInTheDocument();
  });
});

describe('alta', () => {
  it('envía nombre, precio, stock y fecha de registro', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch([
      sesionAdmin,
      {
        metodo: 'POST',
        patron: '/admin/productos',
        status: 201,
        body: { producto: productoDemo },
      },
      { patron: '/admin/productos', body: { productos: [] } },
    ]);

    renderConSesion(<ProductosAdmin />, usuarioAdmin);

    await user.click(
      await screen.findByRole('button', { name: /nuevo producto/i })
    );
    await user.type(screen.getByLabelText(/^nombre$/i), 'Guantes');
    await user.clear(screen.getByLabelText(/precio/i));
    await user.type(screen.getByLabelText(/precio/i), '9.9');
    await user.clear(screen.getByLabelText(/^stock$/i));
    await user.type(screen.getByLabelText(/^stock$/i), '25');
    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => expect(llamadaCon(fetchMock, 'POST')).toBeDefined());
    const enviado = JSON.parse(
      llamadaCon(fetchMock, 'POST')![1].body as string
    );
    expect(enviado).toMatchObject({ nombre: 'Guantes', precio: 9.9, stock: 25 });
    expect(enviado.fechaRegistro).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('edición', () => {
  it('precarga el formulario y guarda con PUT', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch([
      sesionAdmin,
      {
        metodo: 'PUT',
        patron: '/admin/productos/1',
        body: { producto: productoDemo },
      },
      { patron: '/admin/productos', body: { productos: [productoDemo] } },
    ]);

    renderConSesion(<ProductosAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /editar/i }));

    expect(screen.getByLabelText(/^nombre$/i)).toHaveValue(productoDemo.nombre);
    expect(screen.getByLabelText(/precio/i)).toHaveValue(productoDemo.precio);

    await user.click(screen.getByRole('button', { name: /^guardar$/i }));

    await waitFor(() => expect(llamadaCon(fetchMock, 'PUT')).toBeDefined());
    expect(llamadaCon(fetchMock, 'PUT')![0]).toContain('/admin/productos/1');
  });
});

describe('borrado', () => {
  it('borra tras confirmar', async () => {
    const user = userEvent.setup();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = mockFetch([
      sesionAdmin,
      {
        metodo: 'DELETE',
        patron: '/admin/productos/1',
        status: 204,
        body: undefined,
      },
      { patron: '/admin/productos', body: { productos: [productoDemo] } },
    ]);

    renderConSesion(<ProductosAdmin />, usuarioAdmin);
    await user.click(await screen.findByRole('button', { name: /borrar/i }));

    await waitFor(() => expect(llamadaCon(fetchMock, 'DELETE')).toBeDefined());
  });
});
