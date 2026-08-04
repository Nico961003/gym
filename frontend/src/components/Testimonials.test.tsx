import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { testimonials } from '../data/gym';
import Testimonials from './Testimonials';

describe('Testimonials', () => {
  it('muestra todas las opiniones con su autor', () => {
    render(<Testimonials />);
    for (const opinion of testimonials) {
      expect(screen.getByText(`«${opinion.quote}»`)).toBeInTheDocument();
      expect(screen.getByText(opinion.name)).toBeInTheDocument();
      expect(screen.getByText(opinion.role)).toBeInTheDocument();
    }
  });

  it('usa el marcado semántico de cita', () => {
    const { container } = render(<Testimonials />);
    expect(container.querySelectorAll('figure')).toHaveLength(
      testimonials.length
    );
    expect(container.querySelectorAll('blockquote')).toHaveLength(
      testimonials.length
    );
    expect(container.querySelectorAll('figcaption')).toHaveLength(
      testimonials.length
    );
  });

  it('cada avatar lleva el nombre como alternativa', () => {
    render(<Testimonials />);
    for (const opinion of testimonials) {
      expect(
        screen.getByRole('img', { name: opinion.name })
      ).toBeInTheDocument();
    }
  });
});
