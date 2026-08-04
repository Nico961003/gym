import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';
import type { Rol, UserRow } from '../types/user.js';
import type { AdminUserUpdateInput } from '../validation/catalogo.schema.js';

/**
 * Acceso a la tabla `usuarios`.
 * Todas las consultas usan marcadores `?`: mysql2 las envía parametrizadas,
 * de modo que no hay concatenación de SQL ni riesgo de inyección.
 */

export interface CreateUserData {
  username: string;
  nombre: string;
  apellido: string;
  edad: number;
  peso: number;
  estatura: number;
  passwordHash: string;
  rol?: Rol;
}

export async function findByUsername(
  username: string
): Promise<UserRow | null> {
  const [rows] = await pool.query<(UserRow & RowDataPacket)[]>(
    'SELECT * FROM usuarios WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] ?? null;
}

export async function findById(id: number): Promise<UserRow | null> {
  const [rows] = await pool.query<(UserRow & RowDataPacket)[]>(
    'SELECT * FROM usuarios WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ?? null;
}

export async function create(data: CreateUserData): Promise<UserRow> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO usuarios
       (username, nombre, apellido, rol, edad, peso, estatura, password_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.username,
      data.nombre,
      data.apellido,
      data.rol ?? 'CLIENT',
      data.edad,
      data.peso,
      data.estatura,
      data.passwordHash,
    ]
  );

  const created = await findById(result.insertId);
  if (!created) {
    throw new Error('No se pudo recuperar el usuario recién creado');
  }
  return created;
}

export async function existsByUsername(username: string): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT 1 FROM usuarios WHERE username = ? LIMIT 1',
    [username]
  );
  return rows.length > 0;
}

export async function listAll(): Promise<UserRow[]> {
  const [rows] = await pool.query<(UserRow & RowDataPacket)[]>(
    'SELECT * FROM usuarios ORDER BY created_at DESC'
  );
  return rows;
}

export async function update(
  id: number,
  data: AdminUserUpdateInput
): Promise<UserRow | null> {
  await pool.execute(
    `UPDATE usuarios
        SET nombre = ?, apellido = ?, rol = ?, edad = ?, peso = ?, estatura = ?
      WHERE id = ?`,
    [
      data.nombre,
      data.apellido,
      data.rol,
      data.edad,
      data.peso,
      data.estatura,
      id,
    ]
  );
  return findById(id);
}

/** Cambia el hash de la contraseña. Recibe el hash ya calculado. */
export async function updatePassword(
  id: number,
  passwordHash: string
): Promise<void> {
  await pool.execute('UPDATE usuarios SET password_hash = ? WHERE id = ?', [
    passwordHash,
    id,
  ]);
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM usuarios WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}

/** Número de administradores; evita quedarse sin ninguno. */
export async function contarAdmins(): Promise<number> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS total FROM usuarios WHERE rol = 'ADMIN'"
  );
  return Number(rows[0]?.total ?? 0);
}
