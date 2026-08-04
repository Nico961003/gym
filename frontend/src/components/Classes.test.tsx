import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { classes } from '../data/gym';
import Classes from './Classes';

/** La tarjeta que contiene el nombre de la clase. */
function tarjeta(nombre: string): HTMLElement {
  return screen.getByText(nombre).closest('article') as HTMLElement;
}

describe('Classes', () => {
  it('lleva el ancla #clases', () => {
    const { container } = render(<Classes />);
    expect(container.querySelector('#clases')).toBeInTheDocument();
  });

  it('muestra cada clase con sus días, horas, duración y nivel', () => {
    render(<Classes />);
    // Varias clases comparten duración o nivel, así que se busca dentro de
    // la tarjeta de cada una.
    for (const clase of classes) {
      const contenedor = within(tarjeta(clase.name));
      expect(contenedor.getByText(clase.days)).toBeInTheDocument();
      expect(contenedor.getByText(clase.time)).toBeInTheDocument();
      expect(contenedor.getByText(clase.duration)).toBeInTheDocument();
      expect(contenedor.getByText(clase.level)).toBeInTheDocument();
    }
  });

  it('cada clase tiene una imagen con alternativa útil', () => {
    render(<Classes />);
    for (const clase of classes) {
      expect(
        screen.getByRole('img', { name: `Clase de ${clase.name}` })
      ).toBeInTheDocument();
    }
  });

  it('ofrece descargar el horario completo', () => {
    render(<Classes />);
    expect(
      screen.getByRole('link', { name: /descargar horario completo/i })
    ).toBeInTheDocument();
  });
});
