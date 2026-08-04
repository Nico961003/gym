import { gym, trainers } from '../data/gym';
import Icon from './Icon';

function Trainers() {
  return (
    <section id="entrenadores" className="rg-section rg-section--muted">
      <div className="container">
        <div className="text-center mb-5">
          <p className="rg-eyebrow">El equipo</p>
          <h2 className="rg-title">Quién va a entrenarte</h2>
        </div>

        <div className="row g-4">
          {trainers.map((trainer) => (
            <div className="col-sm-6 col-lg-3" key={trainer.name}>
              <article className="rg-trainer">
                <img
                  src={trainer.image}
                  alt={trainer.name}
                  className="rg-trainer__img"
                  loading="lazy"
                />
                <div className="rg-trainer__body">
                  <h3 className="h5 fw-bold mb-1">{trainer.name}</h3>
                  <p className="rg-trainer__role mb-3">{trainer.role}</p>
                  <p className="text-body-secondary small mb-3">{trainer.bio}</p>
                  <div className="d-flex gap-2">
                    {gym.social.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="rg-trainer__social"
                        aria-label={`${trainer.name} en ${item.label}`}
                      >
                        <Icon name={item.icon} size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Trainers;
