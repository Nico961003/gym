import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '../auth/AuthContext';
import Layout from './Layout';

const sinSesion = {
  user: null,
  token: null,
  loading: false,
  isAdmin: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
} as unknown as AuthContextValue;

function renderLayout() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthContext.Provider value={sinSesion}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<p>contenido de la ruta</p>} />
          </Route>
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  it('coloca navbar, contenido y pie', () => {
    renderLayout();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('contenido de la ruta')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('envuelve el contenido de la ruta en <main>', () => {
    const { container } = renderLayout();
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent('contenido de la ruta');
  });
});
