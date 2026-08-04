import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Icon from './Icon';

function svg(container: HTMLElement) {
  return container.querySelector('svg');
}

describe('Icon', () => {
  it('dibuja el icono pedido', () => {
    const { container } = render(<Icon name="check" />);
    expect(svg(container)).toBeInTheDocument();
  });

  it('devuelve null si el nombre no existe', () => {
    const { container } = render(<Icon name="no-existe" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('usa 24 px por defecto y respeta el tamaño indicado', () => {
    const { container: pordefecto } = render(<Icon name="check" />);
    expect(svg(pordefecto)).toHaveAttribute('width', '24');

    const { container: pequeno } = render(<Icon name="check" size={14} />);
    expect(svg(pequeno)).toHaveAttribute('width', '14');
    expect(svg(pequeno)).toHaveAttribute('height', '14');
  });

  it('hereda el color del texto', () => {
    const { container } = render(<Icon name="check" />);
    expect(svg(container)).toHaveAttribute('stroke', 'currentColor');
  });

  it('queda oculto a los lectores de pantalla', () => {
    const { container } = render(<Icon name="check" />);
    expect(svg(container)).toHaveAttribute('aria-hidden', 'true');
    expect(svg(container)).toHaveAttribute('focusable', 'false');
  });

  it('acepta clases adicionales', () => {
    const { container } = render(<Icon name="check" className="me-2" />);
    expect(svg(container)).toHaveClass('me-2');
  });

  it('tiene todos los iconos que usan los datos y la interfaz', () => {
    for (const nombre of [
      'dumbbell',
      'heart',
      'user',
      'leaf',
      'droplet',
      'clock',
      'check',
      'phone',
      'mail',
      'mapPin',
      'chevronLeft',
      'chevronRight',
      'menu',
      'close',
      'instagram',
      'facebook',
      'youtube',
    ]) {
      const { container } = render(<Icon name={nombre} />);
      expect(svg(container), nombre).toBeInTheDocument();
    }
  });
});
