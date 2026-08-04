import { classes } from '../data/gym';
import Icon from './Icon';

function Classes() {
  return (
    <section id="clases" className="rg-section">
      <div className="container">
        <div className="row align-items-end mb-5">
          <div className="col-lg-8">
            <p className="rg-eyebrow">Clases dirigidas</p>
            <h2 className="rg-title mb-0">
              32 sesiones a la semana, sin coste extra
            </h2>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <a href="#contacto" className="btn btn-outline-dark">
              Descargar horario completo
            </a>
          </div>
        </div>

        <div className="row g-4">
          {classes.map((item) => (
            <div className="col-sm-6 col-lg-3" key={item.name}>
              <article className="rg-class">
                <img
                  src={item.image}
                  alt={`Clase de ${item.name}`}
                  className="rg-class__img"
                  loading="lazy"
                />
                <div className="rg-class__body">
                  <span className="badge rg-badge mb-2">{item.level}</span>
                  <h3 className="h5 fw-bold mb-3">{item.name}</h3>
                  <p className="rg-class__meta mb-1">{item.days}</p>
                  <p className="rg-class__meta mb-3">{item.time}</p>
                  <p className="rg-class__duration mb-0">
                    <Icon name="clock" size={15} className="me-2" />
                    {item.duration}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Classes;
