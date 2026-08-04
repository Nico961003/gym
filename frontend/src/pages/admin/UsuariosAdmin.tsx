import { useCallback, useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import { actualizarUsuario, borrarUsuario, fetchUsuarios } from '../../api/gym';
import type { AdminUserUpdate, AuthUser, Rol } from '../../api/types';
import { useAuth } from '../../auth/useAuth';
import Modal from '../../components/Modal';
import { useRecurso } from '../../hooks/useRecurso';

function UsuariosAdmin() {
  const { token, user: yo } = useAuth();

  const cargar = useCallback(
    () => (token ? fetchUsuarios(token) : Promise.resolve([])),
    [token]
  );
  const {
    datos: usuarios,
    cargando,
    errores,
    setErrores,
    refrescar,
  } = useRecurso<AuthUser[]>(cargar, []);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<AdminUserUpdate | null>(null);
  const [guardando, setGuardando] = useState(false);

  const abrirEdicion = (usuario: AuthUser) => {
    setEditando(usuario);
    setForm({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      edad: usuario.edad,
      peso: usuario.peso,
      estatura: usuario.estatura,
    });
    setErrores([]);
    setModalAbierto(true);
  };

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !editando || !form) return;

    setGuardando(true);
    setErrores([]);
    try {
      await actualizarUsuario(token, editando.id, form);
      setModalAbierto(false);
      refrescar();
    } catch (e) {
      setErrores(e instanceof ApiError ? e.messages : ['Error al guardar']);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (usuario: AuthUser) => {
    if (!token) return;
    if (!window.confirm(`¿Borrar al usuario «${usuario.username}»?`)) return;

    try {
      await borrarUsuario(token, usuario.id);
      refrescar();
    } catch (e) {
      setErrores(e instanceof ApiError ? e.messages : ['Error al borrar']);
    }
  };

  const admins = usuarios.filter((u) => u.rol === 'ADMIN').length;

  return (
    <div className="rg-panel__card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h5 fw-bold mb-1">Usuarios ({usuarios.length})</h2>
          <p className="small text-body-secondary mb-0">
            {admins} administrador(es) · {usuarios.length - admins} cliente(s)
          </p>
        </div>
      </div>

      {errores.length > 0 && !modalAbierto && (
        <div className="alert alert-danger" role="alert">
          {errores.join('. ')}
        </div>
      )}

      {cargando ? (
        <p className="text-body-secondary mb-0">Cargando…</p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Nombre</th>
                <th scope="col">Rol</th>
                <th scope="col" className="text-end">
                  Edad
                </th>
                <th scope="col" className="text-end">
                  Peso
                </th>
                <th scope="col" className="text-end">
                  Estatura
                </th>
                <th scope="col" className="text-end">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <th scope="row" className="fw-semibold">
                    {usuario.username}
                    {usuario.id === yo?.id && (
                      <span className="badge text-bg-secondary ms-2">Tú</span>
                    )}
                  </th>
                  <td>
                    {usuario.nombre} {usuario.apellido}
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        usuario.rol === 'ADMIN'
                          ? 'text-bg-danger'
                          : 'text-bg-secondary'
                      }`}
                    >
                      {usuario.rol}
                    </span>
                  </td>
                  <td className="text-end">{usuario.edad}</td>
                  <td className="text-end">{usuario.peso} kg</td>
                  <td className="text-end">{usuario.estatura} m</td>
                  <td className="text-end text-nowrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => abrirEdicion(usuario)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => void eliminar(usuario)}
                      disabled={usuario.id === yo?.id}
                      title={
                        usuario.id === yo?.id
                          ? 'No puedes borrar tu propia cuenta'
                          : undefined
                      }
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        titulo={`Editar ${editando?.username ?? ''}`}
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
      >
        {errores.length > 0 && (
          <div className="alert alert-danger" role="alert">
            <ul className="mb-0 ps-3">
              {errores.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}

        {form && (
          <form onSubmit={guardar} noValidate>
            <div className="row g-3">
              <div className="col-sm-6">
                <label htmlFor="usr-nombre" className="form-label">
                  Nombre
                </label>
                <input
                  id="usr-nombre"
                  className="form-control"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="col-sm-6">
                <label htmlFor="usr-apellido" className="form-label">
                  Apellido
                </label>
                <input
                  id="usr-apellido"
                  className="form-control"
                  value={form.apellido}
                  onChange={(e) =>
                    setForm({ ...form, apellido: e.target.value })
                  }
                  required
                />
              </div>

              <div className="col-12">
                <label htmlFor="usr-rol" className="form-label">
                  Rol
                </label>
                <select
                  id="usr-rol"
                  className="form-select"
                  value={form.rol}
                  onChange={(e) =>
                    setForm({ ...form, rol: e.target.value as Rol })
                  }
                >
                  <option value="CLIENT">CLIENT — socio</option>
                  <option value="ADMIN">ADMIN — acceso total</option>
                </select>
              </div>

              <div className="col-4">
                <label htmlFor="usr-edad" className="form-label">
                  Edad
                </label>
                <input
                  id="usr-edad"
                  type="number"
                  min={14}
                  max={120}
                  className="form-control"
                  value={form.edad}
                  onChange={(e) =>
                    setForm({ ...form, edad: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="col-4">
                <label htmlFor="usr-peso" className="form-label">
                  Peso (kg)
                </label>
                <input
                  id="usr-peso"
                  type="number"
                  step="0.1"
                  min={30}
                  max={400}
                  className="form-control"
                  value={form.peso}
                  onChange={(e) =>
                    setForm({ ...form, peso: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="col-4">
                <label htmlFor="usr-estatura" className="form-label">
                  Estatura (m)
                </label>
                <input
                  id="usr-estatura"
                  type="number"
                  step="0.01"
                  min={1}
                  max={2.6}
                  className="form-control"
                  value={form.estatura}
                  onChange={(e) =>
                    setForm({ ...form, estatura: Number(e.target.value) })
                  }
                  required
                />
              </div>

              <div className="col-12 d-flex justify-content-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setModalAbierto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-brand"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default UsuariosAdmin;
