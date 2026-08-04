export type Rol = 'ADMIN' | 'CLIENT';

/** Fila tal cual vive en la tabla `usuarios`. Nunca sale del backend. */
export interface UserRow {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  edad: number;
  peso: string | number;
  estatura: string | number;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

/** Lo que sí se expone por la API: igual que UserRow pero sin el hash. */
export interface PublicUser {
  id: number;
  username: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  edad: number;
  peso: number;
  estatura: number;
  createdAt: string;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    username: row.username,
    nombre: row.nombre,
    apellido: row.apellido,
    rol: row.rol,
    edad: row.edad,
    peso: Number(row.peso),
    estatura: Number(row.estatura),
    createdAt: new Date(row.created_at).toISOString(),
  };
}
