import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { sedes } from '../data/gym';
import Locations from './Locations';

describe('Locations', () => {
  it('lleva el ancla #ubicaciones', () => {
    const { container } = render(<Locations />);
    expect(container.querySelector('#ubicaciones')).toBeInTheDocument();
  });

  it('muestra todas las sedes con su dirección y horario', () => {
    render(<Locations />);
    for (const sede of sedes) {
      expect(screen.getByText(sede.nombre)).toBeInTheDocument();
      expect(screen.getByText(sede.direccion)).toBeInTheDocument();
      expect(screen.getByText(sede.horario)).toBeInTheDocument();
    }
  });

  it('marca la sede principal', () => {
    const { container } = render(<Locations />);
    expect(screen.getByText(/sede principal/i)).toBeInTheDocument();
    expect(container.querySelectorAll('.rg-sede--principal')).toHaveLength(1);
  });

  it('los teléfonos son enlaces tel: sin espacios', () => {
    render(<Locations />);
    const principal = sedes[0];
    expect(
      screen.getByRole('link', { name: principal.telefono })
    ).toHaveAttribute('href', `tel:${principal.telefono.replace(/\s/g, '')}`);
  });

  it('lista los servicios de cada sede', () => {
    render(<Locations />);
    for (const servicio of sedes[0].servicios) {
      expect(screen.getByText(servicio)).toBeInTheDocument();
    }
  });
});
