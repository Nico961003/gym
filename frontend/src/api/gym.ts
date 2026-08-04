import { apiRequest } from './client';
import type {
  AdminLog,
  AdminUserUpdate,
  AuthUser,
  EntidadLog,
  PanelCliente,
  Producto,
  ProductoInput,
  Promocion,
  PromocionInput,
} from './types';

/* -------------------------------- Público --------------------------------- */

export async function fetchPromocionesPublicas(): Promise<Promocion[]> {
  const { promociones } = await apiRequest<{ promociones: Promocion[] }>(
    '/publico/promociones'
  );
  return promociones;
}

export async function fetchProductosPublicos(): Promise<Producto[]> {
  const { productos } = await apiRequest<{ productos: Producto[] }>(
    '/publico/productos'
  );
  return productos;
}

/* -------------------------------- Cliente --------------------------------- */

export function fetchPanelCliente(token: string): Promise<PanelCliente> {
  return apiRequest<PanelCliente>('/cliente/panel', { token });
}

export function registrarAsistencia(
  token: string
): Promise<Pick<PanelCliente, 'asistencias' | 'resumen'>> {
  return apiRequest('/cliente/asistencias', { method: 'POST', token });
}

/* ------------------------------ Promociones ------------------------------- */

export async function fetchPromociones(token: string): Promise<Promocion[]> {
  const { promociones } = await apiRequest<{ promociones: Promocion[] }>(
    '/admin/promociones',
    { token }
  );
  return promociones;
}

export async function crearPromocion(
  token: string,
  body: PromocionInput
): Promise<Promocion> {
  const { promocion } = await apiRequest<{ promocion: Promocion }>(
    '/admin/promociones',
    { method: 'POST', token, body }
  );
  return promocion;
}

export async function actualizarPromocion(
  token: string,
  id: number,
  body: PromocionInput
): Promise<Promocion> {
  const { promocion } = await apiRequest<{ promocion: Promocion }>(
    `/admin/promociones/${id}`,
    { method: 'PUT', token, body }
  );
  return promocion;
}

export function borrarPromocion(token: string, id: number): Promise<void> {
  return apiRequest<void>(`/admin/promociones/${id}`, {
    method: 'DELETE',
    token,
  });
}

/* -------------------------------- Productos ------------------------------- */

export async function fetchProductos(token: string): Promise<Producto[]> {
  const { productos } = await apiRequest<{ productos: Producto[] }>(
    '/admin/productos',
    { token }
  );
  return productos;
}

export async function crearProducto(
  token: string,
  body: ProductoInput
): Promise<Producto> {
  const { producto } = await apiRequest<{ producto: Producto }>(
    '/admin/productos',
    { method: 'POST', token, body }
  );
  return producto;
}

export async function actualizarProducto(
  token: string,
  id: number,
  body: ProductoInput
): Promise<Producto> {
  const { producto } = await apiRequest<{ producto: Producto }>(
    `/admin/productos/${id}`,
    { method: 'PUT', token, body }
  );
  return producto;
}

export function borrarProducto(token: string, id: number): Promise<void> {
  return apiRequest<void>(`/admin/productos/${id}`, { method: 'DELETE', token });
}

/* -------------------------------- Usuarios -------------------------------- */

export async function fetchUsuarios(token: string): Promise<AuthUser[]> {
  const { usuarios } = await apiRequest<{ usuarios: AuthUser[] }>(
    '/admin/usuarios',
    { token }
  );
  return usuarios;
}

export async function actualizarUsuario(
  token: string,
  id: number,
  body: AdminUserUpdate
): Promise<AuthUser> {
  const { usuario } = await apiRequest<{ usuario: AuthUser }>(
    `/admin/usuarios/${id}`,
    { method: 'PUT', token, body }
  );
  return usuario;
}

export function borrarUsuario(token: string, id: number): Promise<void> {
  return apiRequest<void>(`/admin/usuarios/${id}`, { method: 'DELETE', token });
}

/* ---------------------------------- Logs ---------------------------------- */

export async function fetchLogs(
  token: string,
  entidad?: EntidadLog
): Promise<{ logs: AdminLog[]; total: number }> {
  const query = entidad ? `?entidad=${entidad}` : '';
  return apiRequest<{ logs: AdminLog[]; total: number }>(
    `/admin/logs${query}`,
    { token }
  );
}
