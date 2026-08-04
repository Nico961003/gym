import { useCallback, useState } from 'react';
import { ApiError } from '../api/client';
import { fetchPanelCliente, registrarAsistencia } from '../api/gym';
import type { PanelCliente } from '../api/types';
import { useAuth } from '../auth/useAuth';
import Icon from '../components/Icon';
import PromoCard from '../components/PromoCard';
import { useRecurso } from '../hooks/useRecurso';

const ETIQUETA_PLAN: Record<string, string> = {
  BASICA: 'Cuota Básica',
  PLUS: 'Cuota Plus',
  PREMIUM: 'Cuota Premium',
};

const ETIQUETA_ESTADO: Record<string, { texto: string; clase: string }> = {
  ACTIVA: { texto: 'Activa', clase: 'text-bg-success' },
  PENDIENTE_PAGO: { texto: 'Pendiente de pago', clase: 'text-bg-warning' },
  CANCELADA: { texto: 'Cancelada', clase: 'text-bg-secondary' },
};

function formatearFecha(iso: string | null): string {
  if (!iso) return '—';
  const [anio, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${anio}`;
}

function diasHasta(iso: string): number {
  const objetivo = new Date(`${iso}T00:00:00`);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86_400_000);
}

function AccountPage() {
  const { user, token } = useAuth();

  const cargar = useCallback(
    () => (token ? fetchPanelCliente(token) : Promise.resolve(null)),
    [token]
  );
  const {
    datos: panel,
    cargando,
    errores,
    setErrores,
  } = useRecurso<PanelCliente | null>(cargar, null);

  // Copia local para reflejar al instante la asistencia recién registrada.
  const [extra, setExtra] = useState<Pick<
    PanelCliente,
    'asistencias' | 'resumen'
  > | null>(null);
  const [registrando, setRegistrando] = useState(false);

  const marcarAsistencia = async () => {
    if (!token) return;
    setRegistrando(true);
    try {
      setExtra(await registrarAsistencia(token));
    } catch (e) {
      setErrores(
        e instanceof ApiError ? e.messages : ['No se pudo registrar la entrada']
      );
    } finally {
      setRegistrando(false);
    }
  };

  const asistencias = extra?.asistencias ?? panel?.asistencias ?? [];
  const resumen = extra?.resumen ??
    panel?.resumen ?? { totalMes: 0, totalAnio: 0, ultimaVisita: null };
  const membresia = panel?.membresia;
  const estado = membresia ? ETIQUETA_ESTADO[membresia.estado] : null;

  return (
    <div className="rg-panel">
      <div className="container">
        <header className="mb-5">
          <p className="rg-eyebrow">Mi cuenta</p>
          <h1 className="rg-title">Hola, {user?.nombre}</h1>
          <p className="text-body-secondary mb-0">
            Aquí tienes el resumen de tu membresía y tu actividad.
          </p>
        </header>

        {errores.length > 0 && (
          <div className="alert alert-warning" role="alert">
            {errores.join('. ')}
          </div>
        )}

        {cargando && (
          <p className="text-body-secondary">Cargando tu información…</p>
        )}

        {panel && (
          <>
            <div className="row g-4 mb-5">
              <div className="col-md-6 col-xl-3">
                <div className="rg-kpi h-100">
                  <p className="rg-kpi__label">Membresía</p>
                  <p className="rg-kpi__valor">
                    {membresia ? ETIQUETA_PLAN[membresia.plan] : '—'}
                  </p>
                  {estado && (
                    <span className={`badge ${estado.clase}`}>{estado.texto}</span>
                  )}
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="rg-kpi h-100">
                  <p className="rg-kpi__label">Socio desde</p>
                  <p className="rg-kpi__valor">
                    {formatearFecha(membresia?.fechaInicio ?? null)}
                  </p>
                  <span className="small text-body-secondary">
                    Fecha de inicio de la membresía
                  </span>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="rg-kpi h-100">
                  <p className="rg-kpi__label">Próximo pago</p>
                  <p className="rg-kpi__valor">
                    {formatearFecha(membresia?.fechaProximoPago ?? null)}
                  </p>
                  <span className="small text-body-secondary">
                    {membresia
                      ? `${membresia.importeMensual} € · en ${diasHasta(
                          membresia.fechaProximoPago
                        )} días`
                      : '—'}
                  </span>
                </div>
              </div>

              <div className="col-md-6 col-xl-3">
                <div className="rg-kpi h-100">
                  <p className="rg-kpi__label">Asistencias este mes</p>
                  <p className="rg-kpi__valor">{resumen.totalMes}</p>
                  <span className="small text-body-secondary">
                    {resumen.totalAnio} en lo que va de año
                  </span>
                </div>
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-7">
                <div className="rg-panel__card h-100">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="h5 fw-bold mb-0">Últimas asistencias</h2>
                    <button
                      type="button"
                      className="btn btn-brand btn-sm"
                      onClick={() => void marcarAsistencia()}
                      disabled={registrando}
                    >
                      <Icon name="check" size={14} className="me-1" />
                      {registrando ? 'Registrando…' : 'Registrar entrada'}
                    </button>
                  </div>

                  {asistencias.length === 0 ? (
                    <p className="text-body-secondary mb-0">
                      Todavía no tienes visitas registradas.
                    </p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table align-middle mb-0">
                        <thead>
                          <tr>
                            <th scope="col">Fecha</th>
                            <th scope="col">Entrada</th>
                            <th scope="col">Salida</th>
                            <th scope="col">Actividad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {asistencias.map((a) => (
                            <tr key={a.id}>
                              <th scope="row" className="fw-semibold">
                                {formatearFecha(a.fecha)}
                              </th>
                              <td>{a.horaEntrada.slice(0, 5)}</td>
                              <td>{a.horaSalida?.slice(0, 5) ?? '—'}</td>
                              <td className="text-body-secondary">
                                {a.actividad ?? '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <p className="small text-body-secondary mt-3 mb-0">
                    Última visita: {formatearFecha(resumen.ultimaVisita)}
                  </p>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="rg-panel__card h-100">
                  <h2 className="h5 fw-bold mb-4">Promociones para ti</h2>
                  {panel.promociones.length === 0 ? (
                    <p className="text-body-secondary mb-0">
                      No hay promociones activas ahora mismo.
                    </p>
                  ) : (
                    <div className="d-grid gap-3">
                      {panel.promociones.slice(0, 3).map((promo) => (
                        <PromoCard promo={promo} key={promo.id} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AccountPage;
