import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import type { AdminLog } from '../types/domain.js';

interface AdminLogRow extends RowDataPacket {
  id: number;
  admin_id: number | null;
  admin_username: string;
  accion: AdminLog['accion'];
  entidad: AdminLog['entidad'];
  entidad_id: number | null;
  cambios: unknown;
  ip: string | null;
  created_at: Date;
}

export interface ListLogsOptions {
  limite?: number;
  offset?: number;
  entidad?: AdminLog['entidad'];
  adminId?: number;
}

export async function list({
  limite = 50,
  offset = 0,
  entidad,
  adminId,
}: ListLogsOptions = {}): Promise<AdminLog[]> {
  const condiciones: string[] = [];
  const params: unknown[] = [];

  if (entidad) {
    condiciones.push('entidad = ?');
    params.push(entidad);
  }
  if (adminId) {
    condiciones.push('admin_id = ?');
    params.push(adminId);
  }

  const where =
    condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [rows] = await pool.query<AdminLogRow[]>(
    `SELECT id, admin_id, admin_username, accion, entidad, entidad_id,
            cambios, INET6_NTOA(ip) AS ip, created_at
       FROM admin_logs
       ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?`,
    [...params, Math.min(limite, 200), offset]
  );

  return rows.map((row) => ({
    id: row.id,
    adminId: row.admin_id,
    adminUsername: row.admin_username,
    accion: row.accion,
    entidad: row.entidad,
    entidadId: row.entidad_id,
    cambios:
      typeof row.cambios === 'string'
        ? (JSON.parse(row.cambios) as unknown)
        : row.cambios,
    ip: row.ip,
    createdAt: new Date(row.created_at).toISOString(),
  }));
}

export async function contar(): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS total FROM admin_logs'
  );
  return Number(rows[0]?.total ?? 0);
}
