import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { slides } from '../data/gym';
import Hero from './Hero';

function renderHero() {
  return render(
    <MemoryRouter>
      <Hero />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Hero', () => {
  it('muestra el primer slide al arrancar', () => {
    renderHero();
    expect(screen.getByText(slides[0].title)).toBeInTheDocument();
    expect(screen.getByText(slides[0].eyebrow)).toBeInTheDocument();
  });

  it('pinta un punto de navegación por slide', () => {
    renderHero();
    expect(screen.getAllByRole('tab')).toHaveLength(slides.length);
  });

  it('marca como seleccionado el punto activo', () => {
    renderHero();
    const puntos = screen.getAllByRole('tab');
    expect(puntos[0]).toHaveAttribute('aria-selected', 'true');
    expect(puntos[1]).toHaveAttribute('aria-selected', 'false');
  });

  it('avanza al pulsar «Siguiente»', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderHero();

    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByText(slides[1].title)).toBeInTheDocument();
  });

  it('retrocede en circular al pulsar «Anterior» en el primero', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderHero();

    await user.click(screen.getByRole('button', { name: /anterior/i }));
    expect(
      screen.getByText(slides[slides.length - 1].title)
    ).toBeInTheDocument();
  });

  it('salta al slide que se pulse en los puntos', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderHero();

    await user.click(screen.getAllByRole('tab')[1]);
    expect(screen.getByText(slides[1].title)).toBeInTheDocument();
  });

  it('rota solo pasados 7 segundos', async () => {
    renderHero();
    expect(screen.getByText(slides[0].title)).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(7000);
    await waitFor(() =>
      expect(screen.getByText(slides[1].title)).toBeInTheDocument()
    );
  });

  it('vuelve al principio tras el último slide', async () => {
    renderHero();
    await vi.advanceTimersByTimeAsync(7000 * slides.length);
    await waitFor(() =>
      expect(screen.getByText(slides[0].title)).toBeInTheDocument()
    );
  });

  it('enlaza con tarifas y clases', () => {
    renderHero();
    expect(screen.getByRole('link', { name: /ver tarifas/i })).toHaveAttribute(
      'href',
      '#tarifas'
    );
    expect(
      screen.getByRole('link', { name: /nuestras clases/i })
    ).toHaveAttribute('href', '#clases');
  });

  it('oculta a lectores de pantalla los slides inactivos', () => {
    const { container } = renderHero();
    const laminas = container.querySelectorAll('.rg-hero__slide');
    expect(laminas[0]).toHaveAttribute('aria-hidden', 'false');
    expect(laminas[1]).toHaveAttribute('aria-hidden', 'true');
  });
});
