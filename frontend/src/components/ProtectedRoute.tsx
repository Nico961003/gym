import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../auth/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Si se indica, además de sesión exige rol de administrador. */
  soloAdmin?: boolean;
}

/**
 * Puerta de las rutas privadas. Sin sesión manda al login recordando a dónde
 * se quería ir; con sesión pero sin permisos, a la portada.
 *
 * Es una comodidad para el usuario, no una medida de seguridad: quien mande
 * la petición a mano puede saltárselo. Lo que de verdad protege los datos es
 * `requireRole` en el backend.
 */
function ProtectedRoute({ children, soloAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="rg-splash" role="status" aria-live="polite">
        <span className="spinner-border text-light" aria-hidden="true" />
        <span className="visually-hidden">Comprobando sesión…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/acceder" state={{ desde: location.pathname }} replace />;
  }

  if (soloAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
