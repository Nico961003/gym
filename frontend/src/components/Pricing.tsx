import { plans } from '../data/gym';
import Icon from './Icon';

function Pricing() {
  return (
    <section id="tarifas" className="rg-section">
      <div className="container">
        <div className="text-center mb-5">
          <p className="rg-eyebrow">Tarifas</p>
          <h2 className="rg-title">Sin permanencia ni matrícula</h2>
          <p className="text-body-secondary mt-3 mb-0">
            Todas las cuotas incluyen acceso libre en horario completo. Puedes
            cambiar de plan o darte de baja cuando quieras.
          </p>
        </div>

        <div className="row g-4 justify-content-center">
          {plans.map((plan) => (
            <div className="col-md-6 col-lg-4" key={plan.name}>
              <div
                className={`rg-plan h-100 ${plan.highlighted ? 'rg-plan--featured' : ''}`}
              >
                {plan.highlighted && (
                  <span className="rg-plan__tag">La más elegida</span>
                )}
                <h3 className="h4 fw-bold mb-1">{plan.name}</h3>
                <p className="rg-plan__price mb-4">
                  <span className="rg-plan__amount">{plan.price}</span>
                  <span className="rg-plan__currency"> € / {plan.period}</span>
                </p>
                <ul className="list-unstyled mb-4">
                  {plan.features.map((feature) => (
                    <li className="d-flex align-items-start mb-3" key={feature}>
                      <span className="rg-check">
                        <Icon name="check" size={14} />
                      </span>
                      <span className="small">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#contacto"
                  className={`btn w-100 ${plan.highlighted ? 'btn-brand' : 'btn-outline-dark'}`}
                >
                  Empezar ahora
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
