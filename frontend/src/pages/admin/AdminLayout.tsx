import { NavLink, Outlet } from 'react-router';
import { useAuth } from '../../auth/useAuth';

const secciones = [
  { to: '/admin/promociones', label: 'Promociones' },
  { to: '/admin/productos', label: 'Productos' },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/logs', label: 'Registro de actividad' },
];

function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="rg-panel">
      <div className="container">
        <header className="mb-4">
          <p className="rg-eyebrow">Administración</p>
          <h1 className="rg-title">Panel de control</h1>
          <p className="text-body-secondary mb-0">
            Sesión de {user?.nombre} {user?.apellido} ·{' '}
            <span className="badge text-bg-danger">ADMIN</span>
          </p>
        </header>

        <nav className="rg-admin-tabs mb-4">
          {secciones.map((seccion) => (
            <NavLink
              key={seccion.to}
              to={seccion.to}
              className={({ isActive }) => (isActive ? 'is-active' : '')}
            >
              {seccion.label}
            </NavLink>
          ))}
        </nav>

        <Outlet />
      </div>
    </div>
  );
}

export default AdminLayout;
