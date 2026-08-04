import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/useAuth';
import Icon from '../components/Icon';
import { gym } from '../data/gym';
import { isPasswordValid, passwordRules } from '../validation/password';

const inicial = {
  username: '',
  nombre: '',
  apellido: '',
  edad: '',
  peso: '',
  estatura: '',
  password: '',
};

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(inicial);
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);

  const passwordOk = isPasswordValid(datos.password);
  const passwordTocada = datos.password.length > 0;

  const actualizar = (campo: keyof typeof inicial, valor: string) =>
    setDatos((previo) => ({ ...previo, [campo]: valor }));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrores([]);
    setEnviando(true);

    try {
      await register({
        username: datos.username,
        nombre: datos.nombre,
        apellido: datos.apellido,
        edad: Number(datos.edad),
        peso: Number(datos.peso),
        estatura: Number(datos.estatura),
        password: datos.password,
      });
      await navigate('/mi-cuenta', { replace: true });
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
      <div className="rg-auth__panel rg-auth__panel--ancho">
        <div className="text-center mb-4">
          <h1 className="rg-title text-white h3 mb-2">Hazte socio</h1>
          <p className="text-white-50 mb-0">
            Primera semana gratis en cualquiera de las sedes de {gym.name}
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
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="reg-username" className="form-label">
                Usuario
              </label>
              <input
                id="reg-username"
                name="username"
                className="form-control"
                autoComplete="username"
                value={datos.username}
                onChange={(e) => actualizar('username', e.target.value)}
                required
              />
            </div>

            <div className="col-sm-6">
              <label htmlFor="reg-nombre" className="form-label">
                Nombre
              </label>
              <input
                id="reg-nombre"
                name="nombre"
                className="form-control"
                autoComplete="given-name"
                value={datos.nombre}
                onChange={(e) => actualizar('nombre', e.target.value)}
                required
              />
            </div>

            <div className="col-sm-6">
              <label htmlFor="reg-apellido" className="form-label">
                Apellido
              </label>
              <input
                id="reg-apellido"
                name="apellido"
                className="form-control"
                autoComplete="family-name"
                value={datos.apellido}
                onChange={(e) => actualizar('apellido', e.target.value)}
                required
              />
            </div>

            <div className="col-4">
              <label htmlFor="reg-edad" className="form-label">
                Edad
              </label>
              <input
                id="reg-edad"
                name="edad"
                type="number"
                min={14}
                max={120}
                className="form-control"
                value={datos.edad}
                onChange={(e) => actualizar('edad', e.target.value)}
                required
              />
            </div>

            <div className="col-4">
              <label htmlFor="reg-peso" className="form-label">
                Peso (kg)
              </label>
              <input
                id="reg-peso"
                name="peso"
                type="number"
                step="0.1"
                min={30}
                max={400}
                className="form-control"
                value={datos.peso}
                onChange={(e) => actualizar('peso', e.target.value)}
                required
              />
            </div>

            <div className="col-4">
              <label htmlFor="reg-estatura" className="form-label">
                Estatura (m)
              </label>
              <input
                id="reg-estatura"
                name="estatura"
                type="number"
                step="0.01"
                min={1}
                max={2.6}
                className="form-control"
                value={datos.estatura}
                onChange={(e) => actualizar('estatura', e.target.value)}
                required
              />
            </div>

            <div className="col-12">
              <label htmlFor="reg-password" className="form-label">
                Contraseña
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className={`form-control ${
                  passwordTocada ? (passwordOk ? 'is-valid' : 'is-invalid') : ''
                }`}
                autoComplete="new-password"
                value={datos.password}
                onChange={(e) => actualizar('password', e.target.value)}
                aria-describedby="reg-password-reglas"
                required
              />
              <ul
                className="rg-auth__reglas"
                id="reg-password-reglas"
                aria-live="polite"
              >
                {passwordRules.map((regla) => {
                  const cumple = regla.test(datos.password);
                  return (
                    <li
                      key={regla.id}
                      className={cumple ? 'is-ok' : ''}
                      data-testid={`regla-${regla.id}`}
                    >
                      <Icon name={cumple ? 'check' : 'close'} size={13} />
                      {regla.label}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="col-12">
              <button
                type="submit"
                className="btn btn-brand btn-lg w-100"
                disabled={enviando || !passwordOk}
              >
                {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-white-50 small mt-4 mb-0">
          ¿Ya tienes cuenta?{' '}
          <Link to="/acceder" className="text-white">
            Accede
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
