import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PanelCliente } from '../api/types';
import AccountPage from './AccountPage';
import {
  iniciarSesion,
  mockFetch,
  promocionDemo,
  renderConSesion,
  usuarioCliente,
} from '../test/utils';

const panel: PanelCliente = {
  membresia: {
    id: 1,
    plan: 'PLUS',
    estado: 'ACTIVA',
    fechaInicio: '2025-12-01',
    fechaProximoPago: '2026-09-01',
    importeMensual: 45,
  },
  asistencias: [
    {
      id: 1,
      fecha: '2026-08-03',
      horaEntrada: '18:30:00',
      horaSalida: '19:45:00',
      actividad: 'Spinning',
    },
    {
      id: 2,
      fecha: '2026-08-01',
      horaEntrada: '07:00:00',
      horaSalida: null,
      actividad: null,
    },
  ],
  resumen: { totalMes: 6, totalAnio: 84, ultimaVisita: '2026-08-03' },
  promociones: [promocionDemo],
};

const sesion = { patron: '/auth/me', body: { user: usuarioCliente } };

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
  iniciarSesion();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('membresía', () => {
  it('muestra plan y estado', async () => {
    mockFetch([sesion, { patron: '/cliente/panel', body: panel }]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(await screen.findByText('Cuota Plus')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
  });

  it('muestra la fecha de inicio y la del próximo pago en formato español', async () => {
    mockFetch([sesion, { patron: '/cliente/panel', body: panel }]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(await screen.findByText('01/12/2025')).toBeInTheDocument();
    expect(screen.getByText('01/09/2026')).toBeInTheDocument();
  });

  it('indica el importe y los días que faltan para el cobro', async () => {
    mockFetch([sesion, { patron: '/cliente/panel', body: panel }]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(await screen.findByText(/45 € · en .* días/)).toBeInTheDocument();
  });

  it('sale airoso si el socio aún no tiene membresía', async () => {
    mockFetch([
      sesion,
      { patron: '/cliente/panel', body: { ...panel, membresia: null } },
    ]);
    renderConSesion(<AccountPage />, usuarioCliente);

    await screen.findByText(/hola, ana/i);

    // El KPI de la membresía queda vacío pero la página sigue en pie.
    const kpi = (await screen.findByText('Membresía')).closest(
      '.rg-kpi'
    ) as HTMLElement;
    expect(kpi.textContent).toContain('—');
    expect(screen.queryByText(/cuota plus/i)).not.toBeInTheDocument();
    // Y el resto del panel se sigue viendo.
    expect(screen.getByText('Spinning')).toBeInTheDocument();
  });

  it('refleja el estado de pago pendiente', async () => {
    mockFetch([
      sesion,
      {
        patron: '/cliente/panel',
        body: {
          ...panel,
          membresia: { ...panel.membresia!, estado: 'PENDIENTE_PAGO' },
        },
      },
    ]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(await screen.findByText(/pendiente de pago/i)).toBeInTheDocument();
  });
});

describe('asistencias', () => {
  it('muestra el resumen del mes y del año', async () => {
    mockFetch([sesion, { patron: '/cliente/panel', body: panel }]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(await screen.findByText('6')).toBeInTheDocument();
    expect(screen.getByText(/84 en lo que va de año/i)).toBeInTheDocument();
  });

  it('lista las visitas con hora y actividad', async () => {
    mockFetch([sesion, { patron: '/cliente/panel', body: panel }]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(await screen.findByText('03/08/2026')).toBeInTheDocument();
    expect(screen.getByText('18:30')).toBeInTheDocument();
    expect(screen.getByText('19:45')).toBeInTheDocument();
    expect(screen.getByText('Spinning')).toBeInTheDocument();
  });

  it('marca con guion la salida y la actividad que faltan', async () => {
    mockFetch([sesion, { patron: '/cliente/panel', body: panel }]);
    renderConSesion(<AccountPage />, usuarioCliente);

    await screen.findByText('01/08/2026');
    const fila = screen.getByText('01/08/2026').closest('tr') as HTMLElement;
    expect(fila.textContent).toContain('—');
  });

  it('avisa si no hay ninguna visita', async () => {
    mockFetch([
      sesion,
      {
        patron: '/cliente/panel',
        body: {
          ...panel,
          asistencias: [],
          resumen: { totalMes: 0, totalAnio: 0, ultimaVisita: null },
        },
      },
    ]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(
      await screen.findByText(/todavía no tienes visitas registradas/i)
    ).toBeInTheDocument();
  });

  it('registra una entrada y actualiza el contador', async () => {
    const user = userEvent.setup();
    mockFetch([
      sesion,
      {
        metodo: 'POST',
        patron: '/cliente/asistencias',
        status: 201,
        body: {
          asistencias: panel.asistencias,
          resumen: { totalMes: 7, totalAnio: 85, ultimaVisita: '2026-08-04' },
        },
      },
      { patron: '/cliente/panel', body: panel },
    ]);

    renderConSesion(<AccountPage />, usuarioCliente);
    await user.click(
      await screen.findByRole('button', { name: /registrar entrada/i })
    );

    await waitFor(() => expect(screen.getByText('7')).toBeInTheDocument());
  });

  it('avisa si el check-in falla', async () => {
    const user = userEvent.setup();
    mockFetch([
      sesion,
      {
        metodo: 'POST',
        patron: '/cliente/asistencias',
        status: 500,
        body: { error: 'boom' },
      },
      { patron: '/cliente/panel', body: panel },
    ]);

    renderConSesion(<AccountPage />, usuarioCliente);
    await user.click(
      await screen.findByRole('button', { name: /registrar entrada/i })
    );

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

describe('promociones del socio', () => {
  it('las muestra', async () => {
    mockFetch([sesion, { patron: '/cliente/panel', body: panel }]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(await screen.findByText(promocionDemo.titulo)).toBeInTheDocument();
  });

  it('avisa si no hay ninguna', async () => {
    mockFetch([
      sesion,
      { patron: '/cliente/panel', body: { ...panel, promociones: [] } },
    ]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(
      await screen.findByText(/no hay promociones activas/i)
    ).toBeInTheDocument();
  });
});

describe('errores', () => {
  it('avisa si no se puede cargar la información', async () => {
    mockFetch([
      sesion,
      { patron: '/cliente/panel', status: 500, body: { error: 'boom' } },
    ]);
    renderConSesion(<AccountPage />, usuarioCliente);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});
