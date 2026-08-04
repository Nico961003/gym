import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../auth/useAuth';
import { gym, navLinks } from '../data/gym';
import Icon from './Icon';

function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const enPortada = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const cerrar = () => setOpen(false);

  const salir = () => {
    cerrar();
    logout();
    void navigate('/');
  };

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top rg-navbar ${
        scrolled || !enPortada ? 'rg-navbar--solid' : ''
      }`}
      data-bs-theme="dark"
    >
      <div className="container">
        <Link className="navbar-brand rg-brand" to="/" onClick={cerrar}>
          <span className="rg-brand__mark">RG</span>
          <span className="rg-brand__text">{gym.name}</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="rg-nav"
          aria-label="Alternar navegación"
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`} id="rg-nav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {enPortada &&
              navLinks.map((link) => (
                <li className="nav-item" key={link.href}>
                  <a className="nav-link" href={link.href} onClick={cerrar}>
                    {link.label}
                  </a>
                </li>
              ))}
            {!enPortada && (
              <li className="nav-item">
                <Link className="nav-link" to="/" onClick={cerrar}>
                  Inicio
                </Link>
              </li>
            )}
          </ul>

          <div className="d-flex flex-wrap align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0">
            {user ? (
              <>
                <Link
                  to="/mi-cuenta"
                  className="btn btn-outline-light btn-sm"
                  onClick={cerrar}
                >
                  Mi cuenta
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="btn btn-outline-warning btn-sm"
                    onClick={cerrar}
                  >
                    Administración
                  </Link>
                )}
                <span className="rg-navbar__user">
                  Hola, <strong>{user.nombre}</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={salir}
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/acceder"
                  className="btn btn-outline-light btn-sm"
                  onClick={cerrar}
                >
                  Acceder
                </Link>
                <Link to="/registro" className="btn btn-brand btn-sm" onClick={cerrar}>
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
