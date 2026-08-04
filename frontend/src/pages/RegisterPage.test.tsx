import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  llamadaCon,
  mockFetch,
  panelVacio,
  renderRuta,
  usuarioCliente,
} from '../test/utils';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function rellenar(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText(/^usuario$/i), 'nuevo');
  await user.type(screen.getByLabelText(/^nombre$/i), 'Ana');
  await user.type(screen.getByLabelText(/^apellido$/i), 'Ruiz');
  await user.type(screen.getByLabelText(/^edad$/i), '28');
  await user.type(screen.getByLabelText(/peso/i), '60.5');
  await user.type(screen.getByLabelText(/estatura/i), '1.65');
  await user.type(screen.getByLabelText(/^contraseña$/i), 'Password1!');
}

describe('formulario', () => {
  it('pide todos los datos del socio', async () => {
    renderRuta('/registro');

    expect(await screen.findByLabelText(/^usuario$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nombre$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^apellido$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^edad$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/peso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/estatura/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument();
  });

  it('acota edad, peso y estatura en el propio campo', async () => {
    renderRuta('/registro');

    expect(await screen.findByLabelText(/^edad$/i)).toHaveAttribute('min', '14');
    expect(screen.getByLabelText(/^edad$/i)).toHaveAttribute('max', '120');
    expect(screen.getByLabelText(/peso/i)).toHaveAttribute('min', '30');
    expect(screen.getByLabelText(/estatura/i)).toHaveAttribute('max', '2.6');
  });

  it('enlaza con el acceso para quien ya tiene cuenta', async () => {
    renderRuta('/registro');
    expect(await screen.findByRole('link', { name: /^accede$/i }))
      .toHaveAttribute('href', '/acceder');
  });
});

describe('reglas de la contraseña', () => {
  it('marca cada regla conforme se cumple', async () => {
    const user = userEvent.setup();
    renderRuta('/registro');

    const password = await screen.findByLabelText(/^contraseña$/i);

    await user.type(password, 'abc');
    expect(screen.getByTestId('regla-lowercase')).toHaveClass('is-ok');
    expect(screen.getByTestId('regla-length')).not.toHaveClass('is-ok');
    expect(screen.getByTestId('regla-uppercase')).not.toHaveClass('is-ok');
    expect(screen.getByTestId('regla-special')).not.toHaveClass('is-ok');

    await user.clear(password);
    await user.type(password, 'Password1!');
    for (const id of ['length', 'uppercase', 'lowercase', 'special']) {
      expect(screen.getByTestId(`regla-${id}`), id).toHaveClass('is-ok');
    }
  });

  it('mantiene el botón deshabilitado mientras no se cumplan', async () => {
    const user = userEvent.setup();
    renderRuta('/registro');

    const boton = await screen.findByRole('button', { name: /crear cuenta/i });
    expect(boton).toBeDisabled();

    await user.type(screen.getByLabelText(/^contraseña$/i), 'password');
    expect(boton).toBeDisabled();

    await user.type(screen.getByLabelText(/^contraseña$/i), 'A!');
    expect(boton).toBeEnabled();
  });

  it('anuncia los cambios a los lectores de pantalla', async () => {
    renderRuta('/registro');
    const lista = (await screen.findByTestId('regla-length')).closest('ul');
    expect(lista).toHaveAttribute('aria-live', 'polite');
  });
});

describe('envío', () => {
  it('manda el alta con los números convertidos', async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetch([
      {
        metodo: 'POST',
        patron: '/auth/register',
        status: 201,
        body: { user: usuarioCliente, token: 't' },
      },
      { patron: '/cliente/panel', body: panelVacio },
    ]);

    renderRuta('/registro');
    await rellenar(user);
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    await waitFor(() => expect(llamadaCon(fetchMock, 'POST')).toBeDefined());
    const [, init] = llamadaCon(fetchMock, 'POST')!;
    expect(JSON.parse(init.body as string)).toEqual({
      username: 'nuevo',
      nombre: 'Ana',
      apellido: 'Ruiz',
      edad: 28,
      peso: 60.5,
      estatura: 1.65,
      password: 'Password1!',
    });
  });

  it('tras el alta lleva al área de cliente', async () => {
    const user = userEvent.setup();
    mockFetch([
      {
        metodo: 'POST',
        patron: '/auth/register',
        status: 201,
        body: { user: usuarioCliente, token: 't' },
      },
      { patron: '/cliente/panel', body: panelVacio },
    ]);

    renderRuta('/registro');
    await rellenar(user);
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByText(/hola, ana/i)).toBeInTheDocument();
  });

  it('muestra el error si el usuario ya existe', async () => {
    const user = userEvent.setup();
    mockFetch([
      {
        metodo: 'POST',
        patron: '/auth/register',
        status: 409,
        body: { error: 'Ese nombre de usuario ya está registrado' },
      },
    ]);

    renderRuta('/registro');
    await rellenar(user);
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /ya está registrado/i
    );
  });

  it('muestra todos los errores de validación del backend', async () => {
    const user = userEvent.setup();
    mockFetch([
      {
        metodo: 'POST',
        patron: '/auth/register',
        status: 400,
        body: {
          error: 'Los datos enviados no son válidos',
          detalles: [
            { campo: 'username', mensaje: 'Nombre de usuario no permitido' },
            { campo: 'edad', mensaje: 'La edad mínima es 14 años' },
          ],
        },
      },
    ]);

    renderRuta('/registro');
    await rellenar(user);
    await user.click(screen.getByRole('button', { name: /crear cuenta/i }));

    const alerta = await screen.findByRole('alert');
    expect(alerta).toHaveTextContent(/no permitido/i);
    expect(alerta).toHaveTextContent(/edad mínima/i);
  });
});
