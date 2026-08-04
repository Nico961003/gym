import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { services } from '../data/gym';
import Services from './Services';

describe('Services', () => {
  it('lleva el ancla #servicios', () => {
    const { container } = render(<Services />);
    expect(container.querySelector('#servicios')).toBeInTheDocument();
  });

  it('muestra todos los servicios con su texto', () => {
    render(<Services />);
    for (const servicio of services) {
      expect(screen.getByText(servicio.title)).toBeInTheDocument();
      expect(screen.getByText(servicio.text)).toBeInTheDocument();
    }
  });

  it('pinta un icono por servicio', () => {
    const { container } = render(<Services />);
    // Si algún nombre de icono no existiera, Icon devolvería null y faltarían.
    expect(container.querySelectorAll('.rg-card__icon svg')).toHaveLength(
      services.length
    );
  });

  it('los títulos son encabezados de nivel 3', () => {
    render(<Services />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(
      services.length
    );
  });
});
