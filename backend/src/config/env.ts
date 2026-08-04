import 'dotenv/config';
import { z } from 'zod';

/**
 * Valida las variables de entorno al arrancar. Si falta alguna o tiene un
 * formato inválido, el proceso muere aquí con un mensaje claro en vez de
 * fallar más tarde con un error opaco de conexión.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3307),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1).default('gym'),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().min(1).default('2h'),

  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),

  /** Intentos permitidos en /api/auth por ventana de 15 minutos. */
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),

  /* ---- Administrador inicial (ver src/db/seed.ts) ---- */
  ADMIN_USERNAME: z.string().min(3).default('admin'),
  ADMIN_PASSWORD: z.string().min(1).default('Password_123'),
  ADMIN_NOMBRE: z.string().min(2).default('Admin'),
  ADMIN_APELLIDO: z.string().min(2).default('Rodriguez'),
  /** Crear el administrador inicial al arrancar el servidor. */
  SEED_ON_START: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const detalle = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(
    `Configuración de entorno inválida. Revisa tu archivo .env:\n${detalle}`
  );
}

export const env = parsed.data;
export type Env = typeof env;
