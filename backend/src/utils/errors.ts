/** Error con código HTTP, para que el middleware de errores sepa qué responder. */
export class HttpError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new HttpError(400, message, details);

export const unauthorized = (message = 'Credenciales inválidas') =>
  new HttpError(401, message);

export const conflict = (message: string) => new HttpError(409, message);

export const notFound = (message = 'Recurso no encontrado') =>
  new HttpError(404, message);
