import { useEffect, useState } from 'react';
import { fetchPromocionesPublicas } from '../api/gym';
import type { Promocion } from '../api/types';
import PromoCard from './PromoCard';

/** Promociones vigentes traídas del backend; visibles sin iniciar sesión. */
function Promotions() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [estado, setEstado] = useState<'cargando' | 'listo' | 'error'>(
    'cargando'
  );

  useEffect(() => {
    let cancelado = false;

    fetchPromocionesPublicas()
      .then((datos) => {
        if (cancelado) return;
        setPromociones(datos);
        setEstado('listo');
      })
      .catch(() => {
        if (!cancelado) setEstado('error');
      });

    return () => {
      cancelado = true;
    };
  }, []);

  return (
    <section id="promociones" className="rg-section rg-section--muted">
      <div className="container">
        <div className="text-center mb-5">
          <p className="rg-eyebrow">Promociones</p>
          <h2 className="rg-title">Ofertas en vigor</h2>
        </div>

        {estado === 'cargando' && (
          <p className="text-center text-body-secondary mb-0">
            Cargando promociones…
          </p>
        )}

        {estado === 'error' && (
          <p className="text-center text-body-secondary mb-0">
            Ahora mismo no podemos mostrar las promociones. Pregunta en
            recepción y te informamos.
          </p>
        )}

        {estado === 'listo' && promociones.length === 0 && (
          <p className="text-center text-body-secondary mb-0">
            No hay promociones activas en este momento.
          </p>
        )}

        {estado === 'listo' && promociones.length > 0 && (
          <div className="row g-4">
            {promociones.map((promo) => (
              <div className="col-md-6 col-lg-3" key={promo.id}>
                <PromoCard promo={promo} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Promotions;
