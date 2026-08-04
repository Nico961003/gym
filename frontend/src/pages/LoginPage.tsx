import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/useAuth';
import { gym } from '../data/gym';

interface EstadoRuta {
  desde?: string;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrores([]);
    setEnviando(true);

    try {
      const usuario = await login({ username, password });
      const desde = (location.state as EstadoRuta | null)?.desde;
      // Los administradores entran directamente a su panel.
      await navigate(desde ?? (usuario.rol === 'ADMIN' ? '/admin' : '/mi-cuenta'), {
        replace: true,
      });
    } catch (error) {
      setErrores(
        error instanceof ApiError
          ? error.messages
          : ['Ha ocurrido un error inesperado. Inténtalo de nuevo.']
      );
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="rg-auth" data-bs-theme="dark">
      <div className="rg-auth__panel">
        <div className="text-center mb-4">
          <h1 className="rg-title text-white h3 mb-2">Acceder</h1>
          <p className="text-white-50 mb-0">
            Entra con tu cuenta de socio de {gym.name}
          </p>
        </div>

        {errores.length > 0 && (
          <div className="alert alert-danger" role="alert">
            <ul className="mb-0 ps-3">
              {errores.map((mensaje) => (
                <li key={mensaje}>{mensaje}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="login-username" className="form-label">
              Usuario
            </label>
            <input
              id="login-username"
              name="username"
              className="form-control form-control-lg"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="login-password" className="form-label">
              Contraseña
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-control form-control-lg"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-brand btn-lg w-100"
            disabled={enviando}
          >
            {enviando ? 'Entrando…' : 'Acceder'}
          </button>
        </form>

        <p className="text-center text-white-50 small mt-4 mb-0">
          ¿Todavía no eres socio?{' '}
          <Link to="/registro" className="text-white">
            Crea tu cuenta
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
