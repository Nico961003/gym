import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { gym, navLinks } from '../data/gym';
import Footer from './Footer';

describe('Footer', () => {
  it('muestra la marca y el eslogan', () => {
    render(<Footer />);
    expect(screen.getByText(gym.name)).toBeInTheDocument();
    expect(screen.getByText(`${gym.tagline}.`)).toBeInTheDocument();
  });

  it('repite los enlaces de sección', () => {
    render(<Footer />);
    for (const link of navLinks) {
      expect(screen.getByRole('link', { name: link.label })).toHaveAttribute(
        'href',
        link.href
      );
    }
  });

  it('incluye los datos de contacto', () => {
    render(<Footer />);
    expect(screen.getByText(gym.address)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: gym.phone })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: gym.email })).toBeInTheDocument();
  });

  it('los enlaces sociales tienen nombre accesible', () => {
    render(<Footer />);
    for (const red of gym.social) {
      expect(screen.getByRole('link', { name: red.label })).toBeInTheDocument();
    }
  });

  it('muestra el año en curso en el aviso de copyright', () => {
    render(<Footer />);
    const anio = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`© ${anio}`))
    ).toBeInTheDocument();
  });

  it('advierte de que los datos son ficticios', () => {
    render(<Footer />);
    expect(screen.getByText(/datos ficticios/i)).toBeInTheDocument();
  });
});
