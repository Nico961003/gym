import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import {
  toIsoDate,
  type Asistencia,
  type Membresia,
  type PlanMembresia,
} from '../types/domain.js';

interface MembresiaRow extends RowDataPacket {
  id: number;
  plan: PlanMembresia;
  estado: Membresia['estado'];
  fecha_inicio: Date;
  fecha_proximo_pago: Date;
  importe_mensual: string;
}

interface AsistenciaRow extends RowDataPacket {
  id: number;
  fecha: Date;
  hora_entrada: string;
  hora_salida: string | null;
  actividad: string | null;
}

const IMPORTE_POR_PLAN: Record<PlanMembresia, number> = {
  BASICA: 29,
  PLUS: 45,
  PREMIUM: 75,
};

export async function findByUsuario(
  usuarioId: number
): Promise<Membresia | null> {
  const [rows] = await pool.query<MembresiaRow[]>(
    'SELECT * FROM membresias WHERE usuario_id = ? LIMIT 1',
    [usuarioId]
  );
  const row = rows[0];
  if (!row) return null;

  return {
    id: row.id,
    plan: row.plan,
    estado: row.estado,
    fechaInicio: toIsoDate(row.fecha_inicio),
    fechaProximoPago: toIsoDate(row.fecha_proximo_pago),
    importeMensual: Number(row.importe_mensual),
  };
}

/** Alta de membresía al registrarse: empieza hoy y se cobra dentro de un mes. */
export async function createForUsuario(
  usuarioId: number,
  plan: PlanMembresia = 'BASICA'
): Promise<void> {
  await pool.execute(
    `INSERT IGNORE INTO membresias
       (usuario_id, plan, estado, fecha_inicio, fecha_proximo_pago, importe_mensual)
     VALUES (?, ?, 'ACTIVA', CURRENT_DATE, CURRENT_DATE + INTERVAL 1 MONTH, ?)`,
    [usuarioId, plan, IMPORTE_POR_PLAN[plan]]
  );
}

export async function listAsistencias(
  usuarioId: number,
  limite = 30
): Promise<Asistencia[]> {
  const [rows] = await pool.query<AsistenciaRow[]>(
    `SELECT * FROM asistencias
      WHERE usuario_id = ?
      ORDER BY fecha DESC, hora_entrada DESC
      LIMIT ?`,
    [usuarioId, limite]
  );

  return rows.map((row) => ({
    id: row.id,
    fecha: toIsoDate(row.fecha),
    horaEntrada: row.hora_entrada,
    horaSalida: row.hora_salida,
    actividad: row.actividad,
  }));
}

export interface ResumenAsistencias {
  totalMes: number;
  totalAnio: number;
  ultimaVisita: string | null;
}

export async function resumenAsistencias(
  usuarioId: number
): Promise<ResumenAsistencias> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT
       SUM(fecha >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01')) AS total_mes,
       SUM(YEAR(fecha) = YEAR(CURRENT_DATE))               AS total_anio,
       MAX(fecha)                                          AS ultima
     FROM asistencias
     WHERE usuario_id = ?`,
    [usuarioId]
  );

  const row = rows[0];
  return {
    totalMes: Number(row?.total_mes ?? 0),
    totalAnio: Number(row?.total_anio ?? 0),
    ultimaVisita: row?.ultima ? toIsoDate(row.ultima as Date) : null,
  };
}

/** Registra una entrada de hoy (check-in del cliente). */
export async function registrarAsistencia(usuarioId: number): Promise<void> {
  await pool.execute(
    `INSERT INTO asistencias (usuario_id, fecha, hora_entrada)
     VALUES (?, CURRENT_DATE, CURRENT_TIME)`,
    [usuarioId]
  );
}
