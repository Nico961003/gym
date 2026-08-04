import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { gym, trainers } from '../data/gym';
import Trainers from './Trainers';

describe('Trainers', () => {
  it('lleva el ancla #entrenadores', () => {
    const { container } = render(<Trainers />);
    expect(container.querySelector('#entrenadores')).toBeInTheDocument();
  });

  it('muestra el equipo con nombre, puesto y biografía', () => {
    render(<Trainers />);
    for (const entrenador of trainers) {
      expect(screen.getByText(entrenador.name)).toBeInTheDocument();
      expect(screen.getByText(entrenador.role)).toBeInTheDocument();
      expect(screen.getByText(entrenador.bio)).toBeInTheDocument();
    }
  });

  it('cada foto lleva el nombre como alternativa', () => {
    render(<Trainers />);
    for (const entrenador of trainers) {
      expect(
        screen.getByRole('img', { name: entrenador.name })
      ).toBeInTheDocument();
    }
  });

  it('los enlaces sociales identifican a quién pertenecen', () => {
    render(<Trainers />);
    const primero = trainers[0];
    for (const red of gym.social) {
      expect(
        screen.getByRole('link', { name: `${primero.name} en ${red.label}` })
      ).toBeInTheDocument();
    }
  });
});
