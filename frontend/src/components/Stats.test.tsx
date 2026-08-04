import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { stats } from '../data/gym';
import Stats from './Stats';

describe('Stats', () => {
  it('muestra cada cifra con su etiqueta', () => {
    render(<Stats />);
    for (const dato of stats) {
      expect(screen.getByText(dato.value)).toBeInTheDocument();
      expect(screen.getByText(dato.label)).toBeInTheDocument();
    }
  });

  it('pinta tantos bloques como estadísticas hay', () => {
    const { container } = render(<Stats />);
    expect(container.querySelectorAll('.rg-stats__value')).toHaveLength(
      stats.length
    );
  });
});
