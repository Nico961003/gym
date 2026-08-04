import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { aboutHighlights, gym } from '../data/gym';
import About from './About';

describe('About', () => {
  it('lleva el ancla #nosotros', () => {
    const { container } = render(<About />);
    expect(container.querySelector('#nosotros')).toBeInTheDocument();
  });

  it('muestra la descripción del gimnasio', () => {
    render(<About />);
    expect(screen.getByText(gym.description)).toBeInTheDocument();
  });

  it('enumera los puntos destacados', () => {
    render(<About />);
    for (const punto of aboutHighlights) {
      expect(screen.getByText(punto)).toBeInTheDocument();
    }
  });

  it('la imagen tiene texto alternativo descriptivo', () => {
    render(<About />);
    const imagen = screen.getByRole('img');
    expect(imagen).toHaveAccessibleName(/sala de musculación/i);
  });

  it('carga la imagen de forma diferida', () => {
    render(<About />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });

  it('enlaza con el formulario de contacto', () => {
    render(<About />);
    expect(screen.getByRole('link', { name: /reservar una visita/i })).toHaveAttribute(
      'href',
      '#contacto'
    );
  });
});
