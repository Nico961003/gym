import { useEffect, type ReactNode } from 'react';
import Icon from './Icon';

interface ModalProps {
  titulo: string;
  abierto: boolean;
  onCerrar: () => void;
  children: ReactNode;
  ancho?: 'normal' | 'ancho';
}

/**
 * Diálogo simple. No usa el JS de Bootstrap (solo sus clases) para no mezclar
 * DOM imperativo con el ciclo de vida de React.
 */
function Modal({
  titulo,
  abierto,
  onCerrar,
  children,
  ancho = 'normal',
}: ModalProps) {
  useEffect(() => {
    if (!abierto) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <>
      <div className="rg-modal__backdrop" onClick={onCerrar} aria-hidden="true" />
      <div
        className="rg-modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div
          className={`rg-modal__dialog ${ancho === 'ancho' ? 'rg-modal__dialog--ancho' : ''}`}
        >
          <div className="rg-modal__header">
            <h2 className="h5 fw-bold mb-0">{titulo}</h2>
            <button
              type="button"
              className="btn-close-custom"
              onClick={onCerrar}
              aria-label="Cerrar"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
          <div className="rg-modal__body">{children}</div>
        </div>
      </div>
    </>
  );
}

export default Modal;
