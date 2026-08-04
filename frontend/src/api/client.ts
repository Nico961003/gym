import type { ApiErrorDetail } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

/** Error de la API con el detalle de validación que devuelve el backend. */
export class ApiError extends Error {
  readonly status: number;
  readonly details: ApiErrorDetail[];

  constructor(status: number, message: string, details: ApiErrorDetail[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  /** Todos los mensajes en una lista, para pintarlos de una vez. */
  get messages(): string[] {
    return this.details.length > 0
      ? this.details.map((d) => d.mensaje)
      : [this.message];
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token, signal }: RequestOptions = {}
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      ...(signal ? { signal } : {}),
    });
  } catch {
    throw new ApiError(
      0,
      'No se pudo conectar con el servidor. ¿Está arrancado el backend?'
    );
  }

  const texto = await response.text();
  const datos: unknown = texto ? JSON.parse(texto) : null;

  if (!response.ok) {
    const payload = datos as {
      error?: string;
      detalles?: ApiErrorDetail[];
    } | null;
    throw new ApiError(
      response.status,
      payload?.error ?? `Error ${response.status}`,
      payload?.detalles ?? []
    );
  }

  return datos as T;
}
