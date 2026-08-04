import { gym, navLinks } from '../data/gym';
import Icon from './Icon';

function Footer() {
  return (
    <footer className="rg-footer" data-bs-theme="dark">
      <div className="container">
        <div className="row g-4 py-5">
          <div className="col-lg-4">
            <a className="rg-brand mb-3 d-inline-flex" href="#inicio">
              <span className="rg-brand__mark">RG</span>
              <span className="rg-brand__text">{gym.name}</span>
            </a>
            <p className="text-white-50 mb-4">{gym.tagline}.</p>
            <div className="d-flex gap-2">
              {gym.social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rg-footer__social"
                  aria-label={item.label}
                >
                  <Icon name={item.icon} size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="col-6 col-lg-3">
            <h2 className="h6 text-uppercase fw-bold text-white mb-3">Secciones</h2>
            <ul className="list-unstyled mb-0">
              {navLinks.map((link) => (
                <li className="mb-2" key={link.href}>
                  <a href={link.href} className="rg-footer__link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-lg-2">
            <h2 className="h6 text-uppercase fw-bold text-white mb-3">Horario</h2>
            <ul className="list-unstyled mb-0 text-white-50 small">
              {gym.schedule.map((entry) => (
                <li className="mb-2" key={entry.days}>
                  {entry.days}
                  <br />
                  <span className="text-white">{entry.hours}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-lg-3">
            <h2 className="h6 text-uppercase fw-bold text-white mb-3">Contacto</h2>
            <p className="text-white-50 small mb-2">{gym.address}</p>
            <p className="mb-1">
              <a href={`tel:${gym.phone.replace(/\s/g, '')}`} className="rg-footer__link">
                {gym.phone}
              </a>
            </p>
            <p className="mb-0">
              <a href={`mailto:${gym.email}`} className="rg-footer__link">
                {gym.email}
              </a>
            </p>
          </div>
        </div>

        <div className="rg-footer__bottom">
          <p className="mb-0 small text-white-50">
            © {new Date().getFullYear()} {gym.name}. Sitio de demostración con
            datos ficticios.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
