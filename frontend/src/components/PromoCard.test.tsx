import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Promocion } from '../api/types';
import PromoCard from './PromoCard';

const base: Promocion = {
  id: 1,
  titulo: 'Matrícula gratis',
  descripcion: 'Te quitamos los 40 € de matrícula este mes.',
  tipo: 'IMPORTE_FIJO',
  valor: 40,
  codigo: 'MATRI40',
  fechaInicio: '2026-08-01',
  fechaFin: '2026-09-30',
  activa: true,
  destacada: false,
};

describe('PromoCard', () => {
  it('muestra título y descripción', () => {
    render(<PromoCard promo={base} />);
    expect(screen.getByText(base.titulo)).toBeInTheDocument();
    expect(screen.getByText(base.descripcion)).toBeInTheDocument();
  });

  it('formatea la etiqueta según el tipo de promoción', () => {
    const casos: [Promocion['tipo'], number, string][] = [
      ['PORCENTAJE', 20, '-20%'],
      ['IMPORTE_FIJO', 40, '-40 €'],
      ['MESES_GRATIS', 1, '1 mes gratis'],
      ['MESES_GRATIS', 3, '3 meses gratis'],
      ['OTRO', 0, 'Oferta'],
    ];

    for (const [tipo, valor, esperado] of casos) {
      const { unmount } = render(
        <PromoCard promo={{ ...base, tipo, valor }} />
      );
      expect(screen.getByText(esperado), `${tipo}/${valor}`).toBeInTheDocument();
      unmount();
    }
  });

  it('muestra el código cuando lo hay', () => {
    render(<PromoCard promo={base} />);
    expect(screen.getByText('MATRI40')).toBeInTheDocument();
  });

  it('omite el código si es null', () => {
    render(<PromoCard promo={{ ...base, codigo: null }} />);
    expect(screen.queryByText(/código:/i)).not.toBeInTheDocument();
  });

  it('muestra la fecha de fin en formato español', () => {
    render(<PromoCard promo={base} />);
    expect(screen.getByText(/30\/09\/2026/)).toBeInTheDocument();
  });

  it('marca visualmente las destacadas', () => {
    const { container } = render(
      <PromoCard promo={{ ...base, destacada: true }} />
    );
    expect(container.querySelector('.rg-promo--destacada')).toBeInTheDocument();
    expect(screen.getByText('Destacada')).toBeInTheDocument();
  });

  it('no marca las que no son destacadas', () => {
    const { container } = render(<PromoCard promo={base} />);
    expect(
      container.querySelector('.rg-promo--destacada')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Destacada')).not.toBeInTheDocument();
  });
});
