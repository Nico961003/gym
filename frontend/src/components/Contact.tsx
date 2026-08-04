import { useState, type FormEvent } from 'react';
import { gym } from '../data/gym';
import Icon from './Icon';

function Contact() {
  const [sent, setSent] = useState(false);

  // TODO: conectar con el endpoint del backend cuando exista.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <section id="contacto" className="rg-section rg-section--muted">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-5">
            <p className="rg-eyebrow">Contacto</p>
            <h2 className="rg-title mb-4">Ven a conocernos</h2>
            <p className="text-body-secondary mb-4">
              Pásate sin cita y te enseñamos las instalaciones. La primera
              semana es gratis y no hay que dejar ningún dato bancario.
            </p>

            <ul className="list-unstyled mb-4">
              <li className="d-flex mb-3">
                <span className="rg-contact__icon">
                  <Icon name="mapPin" size={18} />
                </span>
                <span>{gym.address}</span>
              </li>
              <li className="d-flex mb-3">
                <span className="rg-contact__icon">
                  <Icon name="phone" size={18} />
                </span>
                <a href={`tel:${gym.phone.replace(/\s/g, '')}`} className="rg-link">
                  {gym.phone}
                </a>
              </li>
              <li className="d-flex mb-3">
                <span className="rg-contact__icon">
                  <Icon name="mail" size={18} />
                </span>
                <a href={`mailto:${gym.email}`} className="rg-link">
                  {gym.email}
                </a>
              </li>
            </ul>

            <h3 className="h6 fw-bold text-uppercase mb-3">Horario</h3>
            <ul className="list-unstyled mb-0">
              {gym.schedule.map((entry) => (
                <li
                  className="d-flex justify-content-between border-bottom py-2"
                  key={entry.days}
                >
                  <span className="text-body-secondary">{entry.days}</span>
                  <span className="fw-semibold">{entry.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body p-4 p-lg-5">
                <h3 className="h5 fw-bold mb-4">Reserva tu semana de prueba</h3>

                {sent && (
                  <div className="alert alert-success" role="alert">
                    ¡Gracias! Es un formulario de demostración, así que todavía
                    no se envía a ningún sitio.
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="rg-name" className="form-label">
                        Nombre
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="rg-name"
                        name="name"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="rg-email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="rg-email"
                        name="email"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="rg-interest" className="form-label">
                        Me interesa
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="rg-interest"
                        name="interest"
                        defaultValue="sala"
                      >
                        <option value="sala">Sala de musculación</option>
                        <option value="clases">Clases dirigidas</option>
                        <option value="personal">Entrenamiento personal</option>
                        <option value="nutricion">Asesoría nutricional</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label htmlFor="rg-message" className="form-label">
                        Mensaje
                      </label>
                      <textarea
                        className="form-control"
                        id="rg-message"
                        name="message"
                        rows={4}
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-brand btn-lg">
                        Enviar solicitud
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
