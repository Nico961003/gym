import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import { toIsoDate, type Promocion } from '../types/domain.js';
import type { PromocionInput } from '../validation/catalogo.schema.js';

interface PromocionRow extends RowDataPacket {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: Promocion['tipo'];
  valor: string;
  codigo: string | null;
  fecha_inicio: Date;
  fecha_fin: Date;
  activa: number;
  destacada: number;
}

function toPromocion(row: PromocionRow): Promocion {
  return {
    id: row.id,
    titulo: row.titulo,
    descripcion: row.descripcion,
    tipo: row.tipo,
    valor: Number(row.valor),
    codigo: row.codigo,
    fechaInicio: toIsoDate(row.fecha_inicio),
    fechaFin: toIsoDate(row.fecha_fin),
    activa: Boolean(row.activa),
    destacada: Boolean(row.destacada),
  };
}

export async function listAll(): Promise<Promocion[]> {
  const [rows] = await pool.query<PromocionRow[]>(
    'SELECT * FROM promociones ORDER BY destacada DESC, fecha_fin ASC'
  );
  return rows.map(toPromocion);
}

/** Las que se enseñan en la web pública: activas y dentro de fechas. */
export async function listVigentes(): Promise<Promocion[]> {
  const [rows] = await pool.query<PromocionRow[]>(
    `SELECT * FROM promociones
      WHERE activa = TRUE
        AND CURRENT_DATE BETWEEN fecha_inicio AND fecha_fin
      ORDER BY destacada DESC, fecha_fin ASC`
  );
  return rows.map(toPromocion);
}

export async function findById(id: number): Promise<Promocion | null> {
  const [rows] = await pool.query<PromocionRow[]>(
    'SELECT * FROM promociones WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ? toPromocion(rows[0]) : null;
}

export async function create(data: PromocionInput): Promise<Promocion> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO promociones
       (titulo, descripcion, tipo, valor, codigo, fecha_inicio, fecha_fin, activa, destacada)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.titulo,
      data.descripcion,
      data.tipo,
      data.valor,
      data.codigo || null,
      data.fechaInicio,
      data.fechaFin,
      data.activa,
      data.destacada,
    ]
  );

  const creada = await findById(result.insertId);
  if (!creada) throw new Error('No se pudo recuperar la promoción creada');
  return creada;
}

export async function update(
  id: number,
  data: PromocionInput
): Promise<Promocion | null> {
  await pool.execute(
    `UPDATE promociones
        SET titulo = ?, descripcion = ?, tipo = ?, valor = ?, codigo = ?,
            fecha_inicio = ?, fecha_fin = ?, activa = ?, destacada = ?
      WHERE id = ?`,
    [
      data.titulo,
      data.descripcion,
      data.tipo,
      data.valor,
      data.codigo || null,
      data.fechaInicio,
      data.fechaFin,
      data.activa,
      data.destacada,
      id,
    ]
  );
  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM promociones WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}
