import { useCallback, useState, type FormEvent } from 'react';
import { ApiError } from '../../api/client';
import {
  actualizarPromocion,
  borrarPromocion,
  crearPromocion,
  fetchPromociones,
} from '../../api/gym';
import type { Promocion, PromocionInput, TipoPromocion } from '../../api/types';
import { useAuth } from '../../auth/useAuth';
import Modal from '../../components/Modal';
import { useRecurso } from '../../hooks/useRecurso';

const TIPOS: { valor: TipoPromocion; label: string; ayuda: string }[] = [
  { valor: 'PORCENTAJE', label: 'Porcentaje', ayuda: '% de descuento (0-100)' },
  { valor: 'IMPORTE_FIJO', label: 'Importe fijo', ayuda: '€ de descuento' },
  { valor: 'MESES_GRATIS', label: 'Meses gratis', ayuda: 'nº de meses' },
  { valor: 'OTRO', label: 'Otro', ayuda: 'sin valor asociado' },
];

const hoy = () => new Date().toISOString().slice(0, 10);
const enUnMes = () =>
  new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);

const vacia = (): PromocionInput => ({
  titulo: '',
  descripcion: '',
  tipo: 'PORCENTAJE',
  valor: 10,
  codigo: '',
  fechaInicio: hoy(),
  fechaFin: enUnMes(),
  activa: true,
  destacada: false,
});

function PromocionesAdmin() {
  const { token } = useAuth();

  const cargar = useCallback(
    () => (token ? fetchPromociones(token) : Promise.resolve([])),
    [token]
  );
  const {
    datos: promociones,
    cargando,
    errores,
    setErrores,
    refrescar,
  } = useRecurso<Promocion[]>(cargar, []);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Promocion | null>(null);
  const [form, setForm] = useState<PromocionInput>(vacia);
  const [guardando, setGuardando] = useState(false);

  const abrirNueva = () => {
    setEditando(null);
    setForm(vacia());
    setErrores([]);
    setModalAbierto(true);
  };

  const abrirEdicion = (promo: Promocion) => {
    setEditando(promo);
    setForm({ ...promo, codigo: promo.codigo ?? '' });
    setErrores([]);
    setModalAbierto(true);
  };

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;

    setGuardando(true);
    setErrores([]);
    try {
      if (editando) {
        await actualizarPromocion(token, editando.id, form);
      } else {
        await crearPromocion(token, form);
      }
      setModalAbierto(false);
      refrescar();
    } catch (e) {
      setErrores(e instanceof ApiError ? e.messages : ['Error al guardar']);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (promo: Promocion) => {
    if (!token) return;
    if (!window.confirm(`¿Borrar la promoción «${promo.titulo}»?`)) return;

    try {
      await borrarPromocion(token, promo.id);
      refrescar();
    } catch (e) {
      setErrores(e instanceof ApiError ? e.messages : ['Error al borrar']);
    }
  };

  const campo = <K extends keyof PromocionInput>(
    clave: K,
    valor: PromocionInput[K]
  ) => setForm((previo) => ({ ...previo, [clave]: valor }));

  return (
    <div className="rg-panel__card">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h5 fw-bold mb-0">Promociones ({promociones.length})</h2>
        <button type="button" className="btn btn-brand" onClick={abrirNueva}>
          Nueva promoción
        </button>
      </div>

      {errores.length > 0 && !modalAbierto && (
        <div className="alert alert-danger" role="alert">
          {errores.join('. ')}
        </div>
      )}

      {cargando ? (
        <p className="text-body-secondary mb-0">Cargando…</p>
      ) : promociones.length === 0 ? (
        <p className="text-body-secondary mb-0">
          Todavía no hay promociones. Crea la primera.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th scope="col">Título</th>
                <th scope="col">Tipo</th>
                <th scope="col" className="text-end">
                  Valor
                </th>
                <th scope="col">Código</th>
                <th scope="col">Vigencia</th>
                <th scope="col">Estado</th>
                <th scope="col" className="text-end">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {promociones.map((promo) => (
                <tr key={promo.id}>
                  <th scope="row" className="fw-semibold">
                    {promo.titulo}
                    {promo.destacada && (
                      <span className="badge rg-badge ms-2">Destacada</span>
                    )}
                  </th>
                  <td className="small text-body-secondary">{promo.tipo}</td>
                  <td className="text-end">{promo.valor}</td>
                  <td>
                    {promo.codigo ? (
                      <code className="rg-promo__codigo">{promo.codigo}</code>
                    ) : (
                      <span className="text-body-secondary">—</span>
                    )}
                  </td>
                  <td className="small text-body-secondary">
                    {promo.fechaInicio} → {promo.fechaFin}
                  </td>
                  <td>
                    <span
                      className={`badge ${promo.activa ? 'text-bg-success' : 'text-bg-secondary'}`}
                    >
                      {promo.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="text-end text-nowrap">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => abrirEdicion(promo)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => void eliminar(promo)}
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
        titulo={editando ? 'Editar promoción' : 'Nueva promoción'}
        abierto={modalAbierto}
        onCerrar={() => setModalAbierto(false)}
        ancho="ancho"
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

        <form onSubmit={guardar} noValidate>
          <div className="row g-3">
            <div className="col-12">
              <label htmlFor="promo-titulo" className="form-label">
                Título
              </label>
              <input
                id="promo-titulo"
                className="form-control"
                value={form.titulo}
                onChange={(e) => campo('titulo', e.target.value)}
                required
              />
            </div>

            <div className="col-12">
              <label htmlFor="promo-descripcion" className="form-label">
                Descripción
              </label>
              <textarea
                id="promo-descripcion"
                className="form-control"
                rows={3}
                value={form.descripcion}
                onChange={(e) => campo('descripcion', e.target.value)}
                required
              />
            </div>

            <div className="col-sm-6">
              <label htmlFor="promo-tipo" className="form-label">
                Tipo
              </label>
              <select
                id="promo-tipo"
                className="form-select"
                value={form.tipo}
                onChange={(e) => campo('tipo', e.target.value as TipoPromocion)}
              >
                {TIPOS.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
              <div className="form-text">
                {TIPOS.find((t) => t.valor === form.tipo)?.ayuda}
              </div>
            </div>

            <div className="col-sm-6">
              <label htmlFor="promo-valor" className="form-label">
                Valor
              </label>
              <input
                id="promo-valor"
                type="number"
                step="0.01"
                min={0}
                className="form-control"
                value={form.valor}
                onChange={(e) => campo('valor', Number(e.target.value))}
                required
              />
            </div>

            <div className="col-sm-4">
              <label htmlFor="promo-codigo" className="form-label">
                Código (opcional)
              </label>
              <input
                id="promo-codigo"
                className="form-control"
                value={form.codigo}
                onChange={(e) => campo('codigo', e.target.value)}
              />
            </div>

            <div className="col-sm-4">
              <label htmlFor="promo-inicio" className="form-label">
                Desde
              </label>
              <input
                id="promo-inicio"
                type="date"
                className="form-control"
                value={form.fechaInicio}
                onChange={(e) => campo('fechaInicio', e.target.value)}
                required
              />
            </div>

            <div className="col-sm-4">
              <label htmlFor="promo-fin" className="form-label">
                Hasta
              </label>
              <input
                id="promo-fin"
                type="date"
                className="form-control"
                value={form.fechaFin}
                onChange={(e) => campo('fechaFin', e.target.value)}
                required
              />
            </div>

            <div className="col-12 d-flex gap-4">
              <div className="form-check">
                <input
                  id="promo-activa"
                  type="checkbox"
                  className="form-check-input"
                  checked={form.activa}
                  onChange={(e) => campo('activa', e.target.checked)}
                />
                <label htmlFor="promo-activa" className="form-check-label">
                  Activa
                </label>
              </div>
              <div className="form-check">
                <input
                  id="promo-destacada"
                  type="checkbox"
                  className="form-check-input"
                  checked={form.destacada}
                  onChange={(e) => campo('destacada', e.target.checked)}
                />
                <label htmlFor="promo-destacada" className="form-check-label">
                  Destacada en portada
                </label>
              </div>
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 pt-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => setModalAbierto(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-brand" disabled={guardando}>
                {guardando ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default PromocionesAdmin;
