import { aboutHighlights, aboutImage, gym } from '../data/gym';
import Icon from './Icon';

function About() {
  return (
    <section id="nosotros" className="rg-section">
      <div className="container">
        <div className="row align-items-center g-5">
          <div className="col-lg-6">
            <img
              src={aboutImage}
              className="img-fluid rounded-4 shadow-sm w-100 rg-about__img"
              alt="Interior de la sala de musculación de Rodriguez Gym"
              loading="lazy"
            />
          </div>
          <div className="col-lg-6">
            <p className="rg-eyebrow">El gimnasio</p>
            <h2 className="rg-title mb-4">
              Un gimnasio de barrio con medios de club grande
            </h2>
            <p className="text-body-secondary mb-4">{gym.description}</p>
            <ul className="list-unstyled mb-4">
              {aboutHighlights.map((item) => (
                <li className="d-flex align-items-start mb-3" key={item}>
                  <span className="rg-check">
                    <Icon name="check" size={14} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <a href="#contacto" className="btn btn-brand btn-lg">
              Reservar una visita
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
