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

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  fechaRegistro: string;
}

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

export type AccionLog = 'CREAR' | 'ACTUALIZAR' | 'BORRAR' | 'LOGIN';
export type EntidadLog = 'PROMOCION' | 'PRODUCTO' | 'USUARIO' | 'SESION';

export interface AdminLog {
  id: number;
  adminId: number | null;
  adminUsername: string;
  accion: AccionLog;
  entidad: EntidadLog;
  entidadId: number | null;
  cambios: unknown;
  ip: string | null;
  createdAt: string;
}

/** Convierte un DATE/DATETIME de MySQL a `YYYY-MM-DD`. */
export function toIsoDate(value: Date | string): string {
  if (typeof value === 'string') return value.slice(0, 10);
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
