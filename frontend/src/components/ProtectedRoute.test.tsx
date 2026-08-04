import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../api/types';
import { AuthContext, type AuthContextValue } from '../auth/AuthContext';
import ProtectedRoute from './ProtectedRoute';

const cliente: AuthUser = {
  id: 2,
  username: 'demo',
  nombre: 'Ana',
  apellido: 'Ruiz',
  rol: 'CLIENT',
  edad: 28,
  peso: 60,
  estatura: 1.65,
  createdAt: '2026-01-01T00:00:00.000Z',
};
const admin: AuthUser = { ...cliente, rol: 'ADMIN' };

function contexto(user: AuthUser | null, loading = false): AuthContextValue {
  return {
    user,
    token: user ? 't' : null,
    loading,
    isAdmin: user?.rol === 'ADMIN',
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  } as unknown as AuthContextValue;
}

function renderRuta(
  user: AuthUser | null,
  { soloAdmin = false, loading = false, ruta = '/privado' } = {}
) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthContext.Provider value={contexto(user, loading)}>
        <Routes>
          <Route path="/" element={<p>portada</p>} />
          <Route path="/acceder" element={<p>pantalla de acceso</p>} />
          <Route
            path="/privado"
            element={
              <ProtectedRoute soloAdmin={soloAdmin}>
                <p>contenido privado</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('muestra un indicador mientras se comprueba la sesión', () => {
    renderRuta(null, { loading: true });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('contenido privado')).toBeNull();
  });

  it('sin sesión redirige al acceso', () => {
    renderRuta(null);
    expect(screen.getByText('pantalla de acceso')).toBeInTheDocument();
    expect(screen.queryByText('contenido privado')).toBeNull();
  });

  it('con sesión deja ver el contenido', () => {
    renderRuta(cliente);
    expect(screen.getByText('contenido privado')).toBeInTheDocument();
  });

  it('un CLIENT en una ruta de ADMIN acaba en la portada', () => {
    renderRuta(cliente, { soloAdmin: true });
    expect(screen.getByText('portada')).toBeInTheDocument();
    expect(screen.queryByText('contenido privado')).toBeNull();
  });

  it('un ADMIN sí entra en una ruta de ADMIN', () => {
    renderRuta(admin, { soloAdmin: true });
    expect(screen.getByText('contenido privado')).toBeInTheDocument();
  });

  it('sin sesión, una ruta de ADMIN manda al acceso, no a la portada', () => {
    renderRuta(null, { soloAdmin: true });
    expect(screen.getByText('pantalla de acceso')).toBeInTheDocument();
  });
});
