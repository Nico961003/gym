import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TOKEN_STORAGE_KEY } from './AuthContext';
import { AuthProvider } from './AuthProvider';
import { useAuth } from './useAuth';

function respuesta(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

const cliente = { id: 2, username: 'demo', nombre: 'Ana', rol: 'CLIENT' };
const admin = { id: 3, username: 'admin', nombre: 'Admin', rol: 'ADMIN' };

/**
 * Sonda que expone el estado del contexto en el DOM.
 *
 * `login` y `register` propagan el error a quien los llama —así LoginPage
 * puede mostrarlo—, de modo que la sonda tiene que capturarlo igual que hace
 * la página real. Con `void` la promesa rechazada quedaba sin manejar y
 * Vitest la contaba como error de la ejecución.
 */
function Sonda() {
  const { user, token, loading, isAdmin, login, register, logout } = useAuth();
  const ignorar = () => undefined;

  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.username ?? 'sin-sesion'}</span>
      <span data-testid="token">{token ?? 'sin-token'}</span>
      <span data-testid="isAdmin">{String(isAdmin)}</span>
      <button
        onClick={() => {
          login({ username: 'demo', password: 'x' }).catch(ignorar);
        }}
      >
        entrar
      </button>
      <button
        onClick={() => {
          register({
            username: 'demo',
            nombre: 'Ana',
            apellido: 'Ruiz',
            edad: 28,
            peso: 60,
            estatura: 1.6,
            password: 'Password1!',
          }).catch(ignorar);
        }}
      >
        registrar
      </button>
      <button onClick={logout}>salir</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('arranque sin token guardado', () => {
  it('no queda en estado de carga ni llama a la API', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    renderProvider();

    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('user')).toHaveTextContent('sin-sesion');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('arranque con token guardado', () => {
  it('valida el token contra /auth/me y restaura la sesión', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'guardado');
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ user: cliente }));
    vi.stubGlobal('fetch', fetchMock);

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('demo')
    );
    expect(screen.getByTestId('token')).toHaveTextContent('guardado');
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain('/auth/me');
  });

  it('descarta un token inválido y limpia localStorage', async () => {
    localStorage.setItem(TOKEN_STORAGE_KEY, 'caducado');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ error: 'Token inválido' }, 401))
    );

    renderProvider();

    await waitFor(() =>
      expect(screen.getByTestId('loading')).toHaveTextContent('false')
    );
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('user')).toHaveTextContent('sin-sesion');
    expect(screen.getByTestId('token')).toHaveTextContent('sin-token');
  });
});

describe('login', () => {
  it('guarda el token y el usuario', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ user: cliente, token: 'nuevo' }))
    );

    renderProvider();
    await user.click(screen.getByText('entrar'));

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('demo')
    );
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('nuevo');
  });

  it('isAdmin es true solo para el rol ADMIN', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ user: admin, token: 't' }))
    );

    renderProvider();
    expect(screen.getByTestId('isAdmin')).toHaveTextContent('false');

    await user.click(screen.getByText('entrar'));
    await waitFor(() =>
      expect(screen.getByTestId('isAdmin')).toHaveTextContent('true')
    );
  });

  it('si falla no deja rastro de sesión', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ error: 'Credenciales inválidas' }, 401))
    );

    renderProvider();
    await act(async () => {
      await user.click(screen.getByText('entrar'));
    });

    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId('user')).toHaveTextContent('sin-sesion');
  });
});

describe('register', () => {
  it('deja la sesión iniciada al terminar', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ user: cliente, token: 'alta' }, 201))
    );

    renderProvider();
    await user.click(screen.getByText('registrar'));

    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('demo')
    );
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe('alta');
  });
});

describe('logout', () => {
  it('borra token y usuario', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ user: cliente, token: 't' }))
    );

    renderProvider();
    await user.click(screen.getByText('entrar'));
    await waitFor(() =>
      expect(screen.getByTestId('user')).toHaveTextContent('demo')
    );

    await user.click(screen.getByText('salir'));

    expect(screen.getByTestId('user')).toHaveTextContent('sin-sesion');
    expect(screen.getByTestId('token')).toHaveTextContent('sin-token');
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });
});

describe('useAuth fuera del proveedor', () => {
  it('avisa con un error claro', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Sonda />)).toThrow(
      /useAuth debe usarse dentro de <AuthProvider>/
    );
  });
});
