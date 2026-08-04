import type { Promocion } from '../api/types';

/** Texto legible del descuento a partir del tipo y el valor. */
function etiquetaPromocion(promo: Promocion): string {
  switch (promo.tipo) {
    case 'PORCENTAJE':
      return `-${promo.valor}%`;
    case 'IMPORTE_FIJO':
      return `-${promo.valor} €`;
    case 'MESES_GRATIS':
      return promo.valor === 1 ? '1 mes gratis' : `${promo.valor} meses gratis`;
    default:
      return 'Oferta';
  }
}

function formatearFecha(iso: string): string {
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

function PromoCard({ promo }: { promo: Promocion }) {
  return (
    <article className={`rg-promo h-100 ${promo.destacada ? 'rg-promo--destacada' : ''}`}>
      <div className="d-flex justify-content-between align-items-start mb-3">
        <span className="rg-promo__valor">{etiquetaPromocion(promo)}</span>
        {promo.destacada && <span className="rg-chip rg-chip--rojo">Destacada</span>}
      </div>

      <h3 className="h5 fw-bold mb-2">{promo.titulo}</h3>
      <p className="text-body-secondary small flex-grow-1">{promo.descripcion}</p>

      <div className="rg-promo__pie">
        {promo.codigo && (
          <p className="mb-1 small">
            Código: <code className="rg-promo__codigo">{promo.codigo}</code>
          </p>
        )}
        <p className="mb-0 small text-body-secondary">
          Válida hasta el {formatearFecha(promo.fechaFin)}
        </p>
      </div>
    </article>
  );
}

export default PromoCard;
