import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider } from './auth/AuthProvider';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AccountPage from './pages/AccountPage';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './pages/admin/AdminLayout';
import LogsAdmin from './pages/admin/LogsAdmin';
import ProductosAdmin from './pages/admin/ProductosAdmin';
import PromocionesAdmin from './pages/admin/PromocionesAdmin';
import UsuariosAdmin from './pages/admin/UsuariosAdmin';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Público */}
        <Route index element={<Home />} />
        <Route path="acceder" element={<LoginPage />} />
        <Route path="registro" element={<RegisterPage />} />

        {/* Requiere sesión */}
        <Route
          path="mi-cuenta"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        {/* Requiere rol ADMIN */}
        <Route
          path="admin"
          element={
            <ProtectedRoute soloAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="promociones" replace />} />
          <Route path="promociones" element={<PromocionesAdmin />} />
          <Route path="productos" element={<ProductosAdmin />} />
          <Route path="usuarios" element={<UsuariosAdmin />} />
          <Route path="logs" element={<LogsAdmin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    // `BASE_URL` vale «/» en desarrollo y «/<repositorio>/» al publicar en
    // GitHub Pages; sin el basename, el router no encontraría ninguna ruta.
    // Se quita la barra final porque React Router no la admite ahí.
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
