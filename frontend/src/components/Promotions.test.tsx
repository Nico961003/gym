import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Promocion } from '../api/types';
import Promotions from './Promotions';

const promo: Promocion = {
  id: 1,
  titulo: 'Matrícula gratis',
  descripcion: 'Te quitamos los 40 € de matrícula.',
  tipo: 'IMPORTE_FIJO',
  valor: 40,
  codigo: 'MATRI40',
  fechaInicio: '2026-01-01',
  fechaFin: '2026-12-31',
  activa: true,
  destacada: true,
};

function respuesta(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Promotions', () => {
  it('avisa mientras carga', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    render(<Promotions />);
    expect(screen.getByText(/cargando promociones/i)).toBeInTheDocument();
  });

  it('pide las promociones públicas', async () => {
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ promociones: [] }));
    vi.stubGlobal('fetch', fetchMock);

    render(<Promotions />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain(
      '/publico/promociones'
    );
  });

  it('pinta una tarjeta por promoción', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        respuesta({ promociones: [promo, { ...promo, id: 2, titulo: 'Otra' }] })
      )
    );

    render(<Promotions />);

    expect(await screen.findByText('Matrícula gratis')).toBeInTheDocument();
    expect(screen.getByText('Otra')).toBeInTheDocument();
  });

  it('avisa si no hay ninguna activa', async () => {
    vi.stubGlobal('fetch', vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ promociones: [] })));
    render(<Promotions />);

    expect(
      await screen.findByText(/no hay promociones activas/i)
    ).toBeInTheDocument();
  });

  it('degrada con elegancia si la API falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, _init?: RequestInit) => respuesta({ error: 'boom' }, 500))
    );
    render(<Promotions />);

    expect(
      await screen.findByText(/no podemos mostrar las promociones/i)
    ).toBeInTheDocument();
  });

  it('degrada también si no hay red', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      })
    );
    render(<Promotions />);

    expect(
      await screen.findByText(/no podemos mostrar las promociones/i)
    ).toBeInTheDocument();
  });

  it('mantiene el ancla #promociones para el menú', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})));
    const { container } = render(<Promotions />);
    expect(container.querySelector('#promociones')).toBeInTheDocument();
  });
});
