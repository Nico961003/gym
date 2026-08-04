export type Rol = 'ADMIN' | 'CLIENT';

export interface AuthUser {
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

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterPayload {
  username: string;
  nombre: string;
  apellido: string;
  edad: number;
  peso: number;
  estatura: number;
  password: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

/** Detalle de error de validación que devuelve el backend. */
export interface ApiErrorDetail {
  campo: string;
  mensaje: string;
}

/* --------------------------------- Dominio -------------------------------- */

export type TipoPromocion =
  | 'PORCENTAJE'
  | 'IMPORTE_FIJO'
  | 'MESES_GRATIS'
  | 'OTRO';

export interface Promocion {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: TipoPromocion;
  valor: number;
  codigo: string | null;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
  destacada: boolean;
}

export type PromocionInput = Omit<Promocion, 'id' | 'codigo'> & {
  codigo: string;
};

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  fechaRegistro: string;
}

export type ProductoInput = Omit<Producto, 'id'>;

export type PlanMembresia = 'BASICA' | 'PLUS' | 'PREMIUM';
export type EstadoMembresia = 'ACTIVA' | 'PENDIENTE_PAGO' | 'CANCELADA';

export interface Membresia {
  id: number;
  plan: PlanMembresia;
  estado: EstadoMembresia;
  fechaInicio: string;
  fechaProximoPago: string;
  importeMensual: number;
}

export interface Asistencia {
  id: number;
  fecha: string;
  horaEntrada: string;
  horaSalida: string | null;
  actividad: string | null;
}

export interface ResumenAsistencias {
  totalMes: number;
  totalAnio: number;
  ultimaVisita: string | null;
}

export interface PanelCliente {
  membresia: Membresia | null;
  asistencias: Asistencia[];
  resumen: ResumenAsistencias;
  promociones: Promocion[];
}

export interface AdminUserUpdate {
  nombre: string;
  apellido: string;
  rol: Rol;
  edad: number;
  peso: number;
  estatura: number;
}

export type AccionLog = 'CREAR' | 'ACTUALIZAR' | 'BORRAR' | 'LOGIN';
export type EntidadLog = 'PROMOCION' | 'PRODUCTO' | 'USUARIO' | 'SESION';

export interface AdminLog {
  id: number;
  adminId: number | null;
  adminUsername: string;
  accion: AccionLog;
  entidad: EntidadLog;
  entidadId: number | null;
  cambios: Record<string, { antes?: unknown; despues?: unknown }> | null;
  ip: string | null;
  createdAt: string;
}
