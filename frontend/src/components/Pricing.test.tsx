import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { plans } from '../data/gym';
import Pricing from './Pricing';

describe('Pricing', () => {
  it('lleva el ancla #tarifas', () => {
    const { container } = render(<Pricing />);
    expect(container.querySelector('#tarifas')).toBeInTheDocument();
  });

  it('muestra los tres planes con su precio', () => {
    render(<Pricing />);
    for (const plan of plans) {
      expect(screen.getByText(plan.name)).toBeInTheDocument();
      expect(screen.getByText(String(plan.price))).toBeInTheDocument();
    }
  });

  it('enumera las prestaciones de cada plan', () => {
    render(<Pricing />);
    for (const plan of plans) {
      for (const prestacion of plan.features) {
        expect(screen.getByText(prestacion)).toBeInTheDocument();
      }
    }
  });

  it('resalta el plan recomendado', () => {
    const { container } = render(<Pricing />);
    expect(screen.getByText(/la más elegida/i)).toBeInTheDocument();
    expect(container.querySelectorAll('.rg-plan--featured')).toHaveLength(1);
  });

  it('cada plan enlaza al formulario de contacto', () => {
    render(<Pricing />);
    const botones = screen.getAllByRole('link', { name: /empezar ahora/i });
    expect(botones).toHaveLength(plans.length);
    for (const boton of botones) {
      expect(boton).toHaveAttribute('href', '#contacto');
    }
  });

  it('deja claro que no hay permanencia', () => {
    render(<Pricing />);
    expect(screen.getByText(/sin permanencia ni matrícula/i)).toBeInTheDocument();
  });
});
