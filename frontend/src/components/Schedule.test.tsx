import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { classes, gym } from '../data/gym';
import Schedule from './Schedule';

describe('Schedule', () => {
  it('lleva el ancla #horarios', () => {
    const { container } = render(<Schedule />);
    expect(container.querySelector('#horarios')).toBeInTheDocument();
  });

  it('muestra el horario de apertura del centro', () => {
    render(<Schedule />);

    // «Lunes a viernes» aparece también como día de una clase, así que la
    // búsqueda se acota a la tarjeta de apertura.
    const tarjeta = screen
      .getByText(/apertura del centro/i)
      .closest('div') as HTMLElement;

    for (const tramo of gym.schedule) {
      expect(within(tarjeta).getByText(tramo.days)).toBeInTheDocument();
      expect(within(tarjeta).getByText(tramo.hours)).toBeInTheDocument();
    }
  });

  it('presenta las clases en una tabla con cabeceras', () => {
    render(<Schedule />);
    const tabla = screen.getByRole('table');

    for (const cabecera of ['Clase', 'Días', 'Horas', 'Duración']) {
      expect(
        within(tabla).getByRole('columnheader', { name: cabecera })
      ).toBeInTheDocument();
    }
  });

  it('incluye una fila por clase con sus días y duración', () => {
    render(<Schedule />);
    const tabla = screen.getByRole('table');

    for (const clase of classes) {
      const fila = within(tabla).getByRole('rowheader', { name: clase.name });
      const contenedor = fila.closest('tr') as HTMLElement;
      expect(within(contenedor).getByText(clase.days)).toBeInTheDocument();
      expect(within(contenedor).getByText(clase.duration)).toBeInTheDocument();
    }
  });
});
