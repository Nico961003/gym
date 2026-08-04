import type { Request } from 'express';
import { pool } from '../db/pool.js';
import type { AccionLog, EntidadLog } from '../types/domain.js';

/** Tamaño máximo del JSON de cambios que se guarda por registro. */
const MAX_CAMBIOS_BYTES = 2048;

/** Campos que jamás deben acabar en la tabla de auditoría. */
const CAMPOS_SENSIBLES = new Set([
  'password',
  'password_hash',
  'passwordHash',
  'token',
]);

interface RegistrarOpciones {
  req: Request;
  accion: AccionLog;
  entidad: EntidadLog;
  entidadId?: number | null;
  antes?: Record<string, unknown> | null;
  despues?: Record<string, unknown> | null;
}

/**
 * Compara dos versiones de un registro y devuelve solo lo que cambió.
 * Guardar el objeto entero multiplicaría por 10 el tamaño de la tabla sin
 * aportar nada: lo interesante de una auditoría es el delta.
 */
export function calcularCambios(
  antes: Record<string, unknown> | null | undefined,
  despues: Record<string, unknown> | null | undefined
): Record<string, { antes?: unknown; despues?: unknown }> | null {
  if (!antes && !despues) return null;

  const claves = new Set([
    ...Object.keys(antes ?? {}),
    ...Object.keys(despues ?? {}),
  ]);

  const diff: Record<string, { antes?: unknown; despues?: unknown }> = {};

  for (const clave of claves) {
    if (CAMPOS_SENSIBLES.has(clave)) continue;

    const valorAntes = antes?.[clave];
    const valorDespues = despues?.[clave];

    if (JSON.stringify(valorAntes) === JSON.stringify(valorDespues)) continue;

    diff[clave] = {
      ...(antes ? { antes: valorAntes } : {}),
      ...(despues ? { despues: valorDespues } : {}),
    };
  }

  return Object.keys(diff).length > 0 ? diff : null;
}

/** Recorta el JSON si se pasa del límite, para acotar el tamaño de la fila. */
function serializarCambios(cambios: unknown): string | null {
  if (cambios === null) return null;
  const json = JSON.stringify(cambios);
  if (json.length <= MAX_CAMBIOS_BYTES) return json;
  return JSON.stringify({
    truncado: true,
    bytes: json.length,
    resumen: Object.keys(cambios as object),
  });
}

/**
 * Anota una acción de administrador.
 *
 * Nunca lanza: un fallo al auditar no debe tumbar la operación que el
 * administrador acaba de hacer, solo quedar registrado en consola.
 */
export async function registrar({
  req,
  accion,
  entidad,
  entidadId = null,
  antes = null,
  despues = null,
}: RegistrarOpciones): Promise<void> {
  try {
    const admin = req.userRow ?? null;
    const adminId = admin?.id ?? req.user?.sub ?? null;
    const adminUsername = admin?.username ?? req.user?.username ?? 'desconocido';

    const cambios = serializarCambios(calcularCambios(antes, despues));
    const ip = req.ip ?? null;

    await pool.execute(
      `INSERT INTO admin_logs
         (admin_id, admin_username, accion, entidad, entidad_id, cambios, ip)
       VALUES (?, ?, ?, ?, ?, ?, INET6_ATON(?))`,
      [adminId, adminUsername, accion, entidad, entidadId, cambios, ip]
    );
  } catch (error) {
    console.error('[audit] no se pudo registrar la acción:', error);
  }
}
