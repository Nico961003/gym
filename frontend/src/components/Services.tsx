import { services } from '../data/gym';
import Icon from './Icon';

function Services() {
  return (
    <section id="servicios" className="rg-section rg-section--muted">
      <div className="container">
        <div className="text-center mb-5">
          <p className="rg-eyebrow">Servicios</p>
          <h2 className="rg-title">Todo lo que incluye tu cuota</h2>
        </div>

        <div className="row g-4">
          {services.map((service) => (
            <div className="col-md-6 col-lg-4" key={service.title}>
              <div className="card h-100 border-0 shadow-sm rg-card">
                <div className="card-body p-4">
                  <span className="rg-card__icon">
                    <Icon name={service.icon} size={26} />
                  </span>
                  <h3 className="h5 fw-bold mt-4 mb-3">{service.title}</h3>
                  <p className="text-body-secondary mb-0">{service.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
