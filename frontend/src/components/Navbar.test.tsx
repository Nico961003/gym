import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../api/types';
import { AuthContext, type AuthContextValue } from '../auth/AuthContext';
import { navLinks } from '../data/gym';
import Navbar from './Navbar';

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
const admin: AuthUser = { ...cliente, id: 3, username: 'admin', rol: 'ADMIN' };

const logout = vi.fn();

function conSesion(user: AuthUser | null): AuthContextValue {
  return {
    user,
    token: user ? 't' : null,
    loading: false,
    isAdmin: user?.rol === 'ADMIN',
    login: vi.fn(),
    register: vi.fn(),
    logout,
    } as unknown as AuthContextValue;
}

function renderNavbar(user: AuthUser | null, ruta = '/') {
  const Envoltorio = ({ children }: { children: ReactNode }) => (
    <AuthContext.Provider value={conSesion(user)}>
      {children}
    </AuthContext.Provider>
  );

  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <Envoltorio>
        <Routes>
          <Route path="*" element={<Navbar />} />
        </Routes>
      </Envoltorio>
    </MemoryRouter>
  );
}

beforeEach(() => {
  logout.mockReset();
});

describe('sin sesión', () => {
  it('ofrece Acceder y Registrarse', () => {
    renderNavbar(null);
    expect(screen.getByRole('link', { name: /acceder/i })).toHaveAttribute(
      'href',
      '/acceder'
    );
    expect(screen.getByRole('link', { name: /registrarse/i })).toHaveAttribute(
      'href',
      '/registro'
    );
  });

  it('no muestra las opciones de sesión iniciada', () => {
    renderNavbar(null);
    expect(screen.queryByRole('link', { name: /mi cuenta/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /salir/i })).toBeNull();
  });
});

describe('con sesión de cliente', () => {
  it('muestra Mi cuenta, el saludo y Salir', () => {
    renderNavbar(cliente);
    expect(screen.getByRole('link', { name: /mi cuenta/i })).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /salir/i })).toBeInTheDocument();
  });

  it('no muestra el enlace de Administración', () => {
    renderNavbar(cliente);
    expect(screen.queryByRole('link', { name: /administración/i })).toBeNull();
  });

  it('llama a logout al pulsar Salir', async () => {
    const user = userEvent.setup();
    renderNavbar(cliente);

    await user.click(screen.getByRole('button', { name: /salir/i }));
    expect(logout).toHaveBeenCalledTimes(1);
  });
});

describe('con sesión de administrador', () => {
  it('añade el enlace al panel', () => {
    renderNavbar(admin);
    expect(screen.getByRole('link', { name: /administración/i })).toHaveAttribute(
      'href',
      '/admin'
    );
  });
});

describe('enlaces de sección', () => {
  it('en la portada muestra las anclas de las secciones', () => {
    renderNavbar(null, '/');
    for (const link of navLinks) {
      expect(
        screen.getByRole('link', { name: link.label })
      ).toHaveAttribute('href', link.href);
    }
  });

  it('fuera de la portada las sustituye por «Inicio»', () => {
    renderNavbar(null, '/mi-cuenta');
    expect(screen.getByRole('link', { name: /^inicio$/i })).toHaveAttribute(
      'href',
      '/'
    );
    expect(screen.queryByRole('link', { name: /^sedes$/i })).toBeNull();
  });
});

describe('menú móvil', () => {
  it('empieza cerrado y se abre al pulsar el botón', async () => {
    const user = userEvent.setup();
    const { container } = renderNavbar(null);
    const boton = screen.getByRole('button', { name: /alternar navegación/i });

    expect(boton).toHaveAttribute('aria-expanded', 'false');
    expect(container.querySelector('.navbar-collapse.show')).toBeNull();

    await user.click(boton);
    expect(boton).toHaveAttribute('aria-expanded', 'true');
    expect(container.querySelector('.navbar-collapse.show')).toBeInTheDocument();
  });

  it('se cierra al pulsar un enlace', async () => {
    const user = userEvent.setup();
    const { container } = renderNavbar(null);

    await user.click(screen.getByRole('button', { name: /alternar navegación/i }));
    await user.click(screen.getByRole('link', { name: /acceder/i }));

    expect(container.querySelector('.navbar-collapse.show')).toBeNull();
  });
});

describe('fondo al hacer scroll', () => {
  it('se vuelve sólido al bajar en la portada', async () => {
    const { container } = renderNavbar(null, '/');
    expect(container.querySelector('.rg-navbar--solid')).toBeNull();

    window.scrollY = 200;
    window.dispatchEvent(new Event('scroll'));

    await screen.findByRole('navigation');
    expect(container.querySelector('.rg-navbar--solid')).toBeInTheDocument();
    window.scrollY = 0;
  });

  it('siempre es sólido fuera de la portada', () => {
    const { container } = renderNavbar(null, '/admin');
    expect(container.querySelector('.rg-navbar--solid')).toBeInTheDocument();
  });
});
