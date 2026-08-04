import { render, type RenderResult } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { AppRoutes } from '../App';
import type {
  AuthUser,
  PanelCliente,
  Producto,
  Promocion,
} from '../api/types';
import {
  AuthContext,
  TOKEN_STORAGE_KEY,
  type AuthContextValue,
} from '../auth/AuthContext';
import { AuthProvider } from '../auth/AuthProvider';

/* --------------------------- Datos de referencia -------------------------- */

export const usuarioCliente: AuthUser = {
  id: 2,
  username: 'demo',
  nombre: 'Ana',
  apellido: 'Ruiz',
  rol: 'CLIENT',
  edad: 28,
  peso: 60.5,
  estatura: 1.65,
  createdAt: '2026-01-01T00:00:00.000Z',
};

export const usuarioAdmin: AuthUser = {
  ...usuarioCliente,
  id: 3,
  username: 'admin',
  nombre: 'Admin',
  apellido: 'Rodriguez',
  rol: 'ADMIN',
};

export const promocionDemo: Promocion = {
  id: 1,
  titulo: 'Matrícula gratis',
  descripcion: 'Te quitamos los 40 € de matrícula este mes.',
  tipo: 'IMPORTE_FIJO',
  valor: 40,
  codigo: 'MATRI40',
  fechaInicio: '2026-01-01',
  fechaFin: '2026-12-31',
  activa: true,
  destacada: true,
};

export const productoDemo: Producto = {
  id: 1,
  nombre: 'Proteína whey 1 kg',
  precio: 24.9,
  stock: 35,
  fechaRegistro: '2026-07-01',
};

export const panelVacio: PanelCliente = {
  membresia: null,
  asistencias: [],
  resumen: { totalMes: 0, totalAnio: 0, ultimaVisita: null },
  promociones: [],
};

/* ------------------------------ Dobles de red ----------------------------- */

export function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  } as Response;
}

interface Ruta {
  metodo?: string;
  patron: string;
  status?: number;
  body: unknown;
}

/**
 * Sustituye `fetch` por un enrutador de dobles: gana la primera ruta cuyo
 * patrón aparezca en la URL y cuyo método coincida.
 */
export function mockFetch(rutas: Ruta[]) {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const metodo = (init?.method ?? 'GET').toUpperCase();
    const ruta = rutas.find(
      (r) =>
        url.includes(r.patron) && (r.metodo ?? 'GET').toUpperCase() === metodo
    );

    if (!ruta) {
      return jsonResponse({ error: `sin doble para ${metodo} ${url}` }, 404);
    }
    return jsonResponse(ruta.body, ruta.status ?? 200);
  });

  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

/** Devuelve la primera llamada de `fetch` hecha con el método indicado. */
export function llamadaCon(
  fetchMock: ReturnType<typeof mockFetch>,
  metodo: string
): [string, RequestInit] | undefined {
  return fetchMock.mock.calls.find(
    ([, init]) =>
      ((init as RequestInit | undefined)?.method ?? 'GET').toUpperCase() ===
      metodo.toUpperCase()
  ) as [string, RequestInit] | undefined;
}

/* -------------------------------- Renderers ------------------------------- */

/** Marca una sesión iniciada guardando el token que /auth/me validará. */
export function iniciarSesion(): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, 'token-de-prueba');
}

/**
 * Monta la aplicación completa (router + sesión real) en la ruta indicada.
 * Es lo que hay que usar para probar ENRUTADO y protección de rutas.
 */
export function renderRuta(ruta = '/'): RenderResult {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </MemoryRouter>
  );
}

/** Contexto de sesión ya resuelto, sin pasar por /auth/me. */
export function contextoAuth(user: AuthUser | null): AuthContextValue {
  return {
    user,
    token: user ? 'token-de-prueba' : null,
    loading: false,
    isAdmin: user?.rol === 'ADMIN',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  } as unknown as AuthContextValue;
}

/**
 * Monta UN componente con la sesión ya iniciada.
 *
 * Es lo que hay que usar para probar el CONTENIDO de una página: evita montar
 * navbar, pie y las demás rutas, y quita de en medio la llamada a /auth/me,
 * que solo añadía lentitud y una condición de carrera.
 */
export function renderConSesion(
  ui: ReactNode,
  user: AuthUser | null = usuarioCliente,
  ruta = '/'
): RenderResult {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthContext.Provider value={contextoAuth(user)}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>
  );
}
