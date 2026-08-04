import { screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { plans, sedes, trainers } from '../data/gym';
import { mockFetch, promocionDemo, renderRuta } from '../test/utils';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  mockFetch([
    { patron: '/publico/promociones', body: { promociones: [promocionDemo] } },
  ]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('portada', () => {
  it('se ve sin iniciar sesión', async () => {
    const { container } = renderRuta('/');
    await waitFor(() =>
      expect(container.querySelector('#inicio')).toBeInTheDocument()
    );
  });

  it('incluye todas las secciones que enlaza el menú', async () => {
    const { container } = renderRuta('/');

    await waitFor(() =>
      expect(container.querySelector('#ubicaciones')).toBeInTheDocument()
    );

    for (const id of [
      'inicio',
      'ubicaciones',
      'horarios',
      'clases',
      'tarifas',
      'promociones',
      'contacto',
    ]) {
      expect(container.querySelector(`#${id}`), id).toBeInTheDocument();
    }
  });

  it('también trae nosotros, servicios y entrenadores', async () => {
    const { container } = renderRuta('/');

    await waitFor(() =>
      expect(container.querySelector('#nosotros')).toBeInTheDocument()
    );
    expect(container.querySelector('#servicios')).toBeInTheDocument();
    expect(container.querySelector('#entrenadores')).toBeInTheDocument();
  });

  it('lista sedes, planes y entrenadores', async () => {
    renderRuta('/');

    await waitFor(() =>
      expect(screen.getByText(sedes[0].nombre)).toBeInTheDocument()
    );
    for (const sede of sedes) {
      expect(screen.getByText(sede.nombre)).toBeInTheDocument();
    }
    for (const plan of plans) {
      expect(screen.getByText(plan.name)).toBeInTheDocument();
    }
    for (const entrenador of trainers) {
      expect(screen.getByText(entrenador.name)).toBeInTheDocument();
    }
  });

  it('muestra las promociones que llegan de la API', async () => {
    renderRuta('/');
    expect(await screen.findByText(promocionDemo.titulo)).toBeInTheDocument();
  });

  it('invita a hacerse socio', async () => {
    renderRuta('/');
    expect(
      await screen.findByRole('link', { name: /hazte socio/i })
    ).toBeInTheDocument();
  });

  it('sigue en pie aunque falle la carga de promociones', async () => {
    mockFetch([
      { patron: '/publico/promociones', status: 500, body: { error: 'boom' } },
    ]);

    const { container } = renderRuta('/');

    await waitFor(() =>
      expect(container.querySelector('#tarifas')).toBeInTheDocument()
    );
    expect(
      await screen.findByText(/no podemos mostrar las promociones/i)
    ).toBeInTheDocument();
  });
});
