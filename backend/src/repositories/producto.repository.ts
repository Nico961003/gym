import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import { toIsoDate, type Producto } from '../types/domain.js';
import type { ProductoInput } from '../validation/catalogo.schema.js';

interface ProductoRow extends RowDataPacket {
  id: number;
  nombre: string;
  precio: string;
  stock: number;
  fecha_registro: Date;
}

function toProducto(row: ProductoRow): Producto {
  return {
    id: row.id,
    nombre: row.nombre,
    precio: Number(row.precio),
    stock: row.stock,
    fechaRegistro: toIsoDate(row.fecha_registro),
  };
}

export async function listAll(): Promise<Producto[]> {
  const [rows] = await pool.query<ProductoRow[]>(
    'SELECT * FROM productos ORDER BY nombre ASC'
  );
  return rows.map(toProducto);
}

export async function findById(id: number): Promise<Producto | null> {
  const [rows] = await pool.query<ProductoRow[]>(
    'SELECT * FROM productos WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ? toProducto(rows[0]) : null;
}

export async function create(data: ProductoInput): Promise<Producto> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO productos (nombre, precio, stock, fecha_registro)
     VALUES (?, ?, ?, ?)`,
    [data.nombre, data.precio, data.stock, data.fechaRegistro]
  );

  const creado = await findById(result.insertId);
  if (!creado) throw new Error('No se pudo recuperar el producto creado');
  return creado;
}

export async function update(
  id: number,
  data: ProductoInput
): Promise<Producto | null> {
  await pool.execute(
    `UPDATE productos
        SET nombre = ?, precio = ?, stock = ?, fecha_registro = ?
      WHERE id = ?`,
    [data.nombre, data.precio, data.stock, data.fechaRegistro, id]
  );
  return findById(id);
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM productos WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}
