import { sedes } from '../data/gym';
import Icon from './Icon';

function Locations() {
  return (
    <section id="ubicaciones" className="rg-section rg-section--muted">
      <div className="container">
        <div className="text-center mb-5">
          <p className="rg-eyebrow">Dónde estamos</p>
          <h2 className="rg-title">Tres sedes, una sola cuota</h2>
          <p className="text-body-secondary mt-3 mb-0">
            Tu abono sirve para entrar en cualquiera de nuestros centros, sin
            coste adicional.
          </p>
        </div>

        <div className="row g-4">
          {sedes.map((sede) => (
            <div className="col-lg-4" key={sede.nombre}>
              <article
                className={`rg-sede h-100 ${sede.principal ? 'rg-sede--principal' : ''}`}
              >
                {sede.principal && (
                  <span className="badge rg-badge mb-3">Sede principal</span>
                )}
                <h3 className="h5 fw-bold mb-3">{sede.nombre}</h3>

                <p className="d-flex align-items-start mb-2">
                  <span className="rg-sede__icon">
                    <Icon name="mapPin" size={16} />
                  </span>
                  <span>
                    {sede.direccion}
                    <br />
                    <span className="text-body-secondary">{sede.ciudad}</span>
                  </span>
                </p>

                <p className="d-flex align-items-start mb-2">
                  <span className="rg-sede__icon">
                    <Icon name="phone" size={16} />
                  </span>
                  <a
                    href={`tel:${sede.telefono.replace(/\s/g, '')}`}
                    className="rg-link"
                  >
                    {sede.telefono}
                  </a>
                </p>

                <p className="d-flex align-items-start mb-3">
                  <span className="rg-sede__icon">
                    <Icon name="clock" size={16} />
                  </span>
                  <span className="small text-body-secondary">
                    {sede.horario}
                  </span>
                </p>

                <ul className="list-unstyled mb-0 d-flex flex-wrap gap-2">
                  {sede.servicios.map((servicio) => (
                    <li className="rg-chip" key={servicio}>
                      {servicio}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Locations;
