import { Link } from 'react-router';
import Icon from './Icon';

const ventajas = [
  'Primera semana de prueba gratuita',
  'Sin matrícula ni permanencia',
  'Acceso a las tres sedes con la misma cuota',
  'Plan de entrenamiento inicial incluido',
];

/** Invitación a darse de alta. */
function JoinCta() {
  return (
    <section className="rg-join" data-bs-theme="dark">
      <div className="container">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <p className="rg-eyebrow">Únete</p>
            <h2 className="rg-title text-white mb-3">
              Empieza esta semana y las primeras clases corren de nuestra cuenta
            </h2>
            <ul className="list-unstyled mb-0">
              {ventajas.map((ventaja) => (
                <li className="d-flex align-items-start mb-2" key={ventaja}>
                  <span className="rg-check">
                    <Icon name="check" size={14} />
                  </span>
                  <span className="text-white-50">{ventaja}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-5 text-lg-end">
            <Link to="/registro" className="btn btn-brand btn-lg px-5 mb-3">
              Hazte socio
            </Link>
            <p className="text-white-50 small mb-0">
              ¿Ya eres socio?{' '}
              <Link to="/acceder" className="text-white">
                Accede a tu cuenta
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default JoinCta;
