import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Modal from './Modal';

function abrir(props: Partial<Parameters<typeof Modal>[0]> = {}) {
  const onCerrar = vi.fn();
  const utils = render(
    <Modal titulo="Editar producto" abierto onCerrar={onCerrar} {...props}>
      <p>Contenido del diálogo</p>
    </Modal>
  );
  return { ...utils, onCerrar };
}

describe('Modal', () => {
  it('no pinta nada cuando está cerrado', () => {
    const { container } = render(
      <Modal titulo="X" abierto={false} onCerrar={() => {}}>
        <p>oculto</p>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra título y contenido cuando está abierto', () => {
    abrir();
    expect(screen.getByText('Editar producto')).toBeInTheDocument();
    expect(screen.getByText('Contenido del diálogo')).toBeInTheDocument();
  });

  it('se anuncia como diálogo modal', () => {
    abrir();
    const dialogo = screen.getByRole('dialog');
    expect(dialogo).toHaveAttribute('aria-modal', 'true');
    expect(dialogo).toHaveAttribute('aria-label', 'Editar producto');
  });

  it('cierra al pulsar el botón de cerrar', async () => {
    const user = userEvent.setup();
    const { onCerrar } = abrir();

    await user.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('cierra al pulsar fuera del diálogo', async () => {
    const user = userEvent.setup();
    const { container, onCerrar } = abrir();

    const fondo = container.querySelector('.rg-modal__backdrop');
    await user.click(fondo as Element);
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('cierra con la tecla Escape', async () => {
    const user = userEvent.setup();
    const { onCerrar } = abrir();

    await user.keyboard('{Escape}');
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it('otras teclas no lo cierran', async () => {
    const user = userEvent.setup();
    const { onCerrar } = abrir();

    await user.keyboard('{Enter}');
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('deja de escuchar Escape al cerrarse', async () => {
    const user = userEvent.setup();
    const onCerrar = vi.fn();
    const { rerender } = render(
      <Modal titulo="X" abierto onCerrar={onCerrar}>
        <p>x</p>
      </Modal>
    );

    rerender(
      <Modal titulo="X" abierto={false} onCerrar={onCerrar}>
        <p>x</p>
      </Modal>
    );
    await user.keyboard('{Escape}');

    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('admite la variante ancha', () => {
    const { container } = abrir({ ancho: 'ancho' });
    expect(
      container.querySelector('.rg-modal__dialog--ancho')
    ).toBeInTheDocument();
  });
});
