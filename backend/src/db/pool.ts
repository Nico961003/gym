import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

/**
 * Pool de conexiones compartido. mysql2 reutiliza conexiones, así que no hay
 * que abrir/cerrar en cada consulta.
 */
export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Devuelve DECIMAL como string para no perder precisión; el repositorio
  // se encarga de convertirlo a number.
  decimalNumbers: false,
  charset: 'utf8mb4_unicode_ci',
});

/** Comprueba que la base de datos responde. Se usa en /api/health. */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
