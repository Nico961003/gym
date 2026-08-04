import { useCallback, useState } from 'react';
import { fetchLogs } from '../../api/gym';
import type { AdminLog, EntidadLog } from '../../api/types';
import { useAuth } from '../../auth/useAuth';
import { useRecurso } from '../../hooks/useRecurso';

const FILTROS: { valor: EntidadLog | ''; label: string }[] = [
  { valor: '', label: 'Todo' },
  { valor: 'PROMOCION', label: 'Promociones' },
  { valor: 'PRODUCTO', label: 'Productos' },
  { valor: 'USUARIO', label: 'Usuarios' },
  { valor: 'SESION', label: 'Accesos' },
];

const COLOR_ACCION: Record<AdminLog['accion'], string> = {
  CREAR: 'text-bg-success',
  ACTUALIZAR: 'text-bg-primary',
  BORRAR: 'text-bg-danger',
  LOGIN: 'text-bg-secondary',
};

function formatearInstante(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Resume el diff en una línea legible. */
function resumirCambios(cambios: AdminLog['cambios']): string {
  if (!cambios) return '—';

  return Object.entries(cambios)
    .map(([campo, { antes, despues }]) => {
      if (antes === undefined) return `${campo}: ${JSON.stringify(despues)}`;
      if (despues === undefined) return `${campo}: ${JSON.stringify(antes)}`;
      return `${campo}: ${JSON.stringify(antes)} → ${JSON.stringify(despues)}`;
    })
    .join(' · ');
}

function LogsAdmin() {
  const { token } = useAuth();

  const [filtro, setFiltro] = useState<EntidadLog | ''>('');

  const cargar = useCallback(
    () =>
      token
        ? fetchLogs(token, filtro || undefined)
        : Promise.resolve({ logs: [], total: 0 }),
    [token, filtro]
  );
  const {
    datos: { logs, total },
    cargando,
    errores,
  } = useRecurso<{ logs: AdminLog[]; total: number }>(cargar, {
    logs: [],
    total: 0,
  });

  return (
    <div className="rg-panel__card">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h2 className="h5 fw-bold mb-1">Registro de actividad</h2>
          <p className="small text-body-secondary mb-0">
            {total} movimientos registrados · solo escrituras y accesos de
            administradores · se conservan 180 días
          </p>
        </div>

        <div className="btn-group" role="group" aria-label="Filtrar por entidad">
          {FILTROS.map((f) => (
            <button
              key={f.valor || 'todo'}
              type="button"
              className={`btn btn-sm ${
                filtro === f.valor ? 'btn-brand' : 'btn-outline-secondary'
              }`}
              onClick={() => setFiltro(f.valor)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {errores.length > 0 && (
        <div className="alert alert-danger" role="alert">
          {errores.join('. ')}
        </div>
      )}

      {cargando ? (
        <p className="text-body-secondary mb-0">Cargando…</p>
      ) : logs.length === 0 ? (
        <p className="text-body-secondary mb-0">
          No hay movimientos registrados con este filtro.
        </p>
      ) : (
        <div className="table-responsive">
          <table className="table align-middle rg-tabla-logs">
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Administrador</th>
                <th scope="col">Acción</th>
                <th scope="col">Entidad</th>
                <th scope="col">Cambios</th>
                <th scope="col">IP</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="small text-nowrap">
                    {formatearInstante(log.createdAt)}
                  </td>
                  <th scope="row" className="fw-semibold">
                    {log.adminUsername}
                  </th>
                  <td>
                    <span className={`badge ${COLOR_ACCION[log.accion]}`}>
                      {log.accion}
                    </span>
                  </td>
                  <td className="small">
                    {log.entidad}
                    {log.entidadId !== null && (
                      <span className="text-body-secondary"> #{log.entidadId}</span>
                    )}
                  </td>
                  <td className="small text-body-secondary rg-tabla-logs__cambios">
                    {resumirCambios(log.cambios)}
                  </td>
                  <td className="small text-body-secondary">{log.ip ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LogsAdmin;
