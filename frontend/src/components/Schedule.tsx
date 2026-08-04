import { classes, gym } from '../data/gym';
import Icon from './Icon';

function Schedule() {
  return (
    <section id="horarios" className="rg-section">
      <div className="container">
        <div className="text-center mb-5">
          <p className="rg-eyebrow">Horarios</p>
          <h2 className="rg-title">Abrimos a las seis de la mañana</h2>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="rg-horario-card h-100">
              <h3 className="h6 text-uppercase fw-bold mb-4">
                Apertura del centro
              </h3>
              <ul className="list-unstyled mb-0">
                {gym.schedule.map((entry) => (
                  <li
                    className="d-flex justify-content-between align-items-center border-bottom py-3"
                    key={entry.days}
                  >
                    <span className="text-body-secondary">{entry.days}</span>
                    <span className="fw-semibold">{entry.hours}</span>
                  </li>
                ))}
              </ul>
              <p className="small text-body-secondary mt-4 mb-0">
                <Icon name="clock" size={14} className="me-2" />
                Los festivos se anuncian con una semana de antelación.
              </p>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="rg-horario-card h-100">
              <h3 className="h6 text-uppercase fw-bold mb-4">
                Clases dirigidas
              </h3>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Clase</th>
                      <th scope="col">Días</th>
                      <th scope="col">Horas</th>
                      <th scope="col" className="text-end">
                        Duración
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((clase) => (
                      <tr key={clase.name}>
                        <th scope="row" className="fw-semibold">
                          {clase.name}
                        </th>
                        <td className="small text-body-secondary">
                          {clase.days}
                        </td>
                        <td className="small text-body-secondary">
                          {clase.time}
                        </td>
                        <td className="text-end small">{clase.duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Schedule;
