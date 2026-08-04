import { createApp } from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnection, closePool } from './db/pool.js';
import { seedAdmin } from './db/seed.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`[api] escuchando en http://localhost:${env.PORT}`);
  console.log(`[api] entorno: ${env.NODE_ENV}`);

  void arrancar();
});

async function arrancar(): Promise<void> {
  const conectada = await checkDatabaseConnection();

  if (!conectada) {
    console.log(
      `[db] SIN CONEXIÓN a ${env.DB_HOST}:${env.DB_PORT} — ¿has ejecutado "npm run db:up"?`
    );
    return;
  }

  console.log(`[db] conectado a ${env.DB_NAME}@${env.DB_HOST}:${env.DB_PORT}`);

  if (!env.SEED_ON_START) return;

  // Crear el administrador inicial es idempotente y cuesta una consulta, así
  // que se hace en cada arranque. Si falla, la API sigue en pie: no poder
  // sembrar no es motivo para dejar el servicio caído.
  try {
    await seedAdmin();
  } catch (error) {
    console.error('[seed] no se pudo comprobar el administrador:', error);
  }
}

async function shutdown(signal: string): Promise<void> {
  console.log(`\n[api] ${signal} recibido, cerrando…`);
  server.close();
  await closePool();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
