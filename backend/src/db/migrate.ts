/**
 * Runner de migraciones.
 *
 * Ejecuta en orden los .sql de `db/migrations` que todavía no se hayan
 * aplicado y lo anota en la tabla `schema_migrations`. Es idempotente: se
 * puede lanzar tantas veces como haga falta.
 *
 *   npm run db:migrate
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const MIGRATIONS_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../db/migrations'
);

export async function runMigrations(): Promise<string[]> {
  // Conexión propia: las migraciones traen varias sentencias por archivo.
  const connection = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    multipleStatements: true,
  });

  const aplicadas: string[] = [];

  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        nombre     VARCHAR(255) NOT NULL,
        aplicada_en TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (nombre)
      ) ENGINE = InnoDB
    `);

    const [filas] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT nombre FROM schema_migrations'
    );
    const yaAplicadas = new Set(filas.map((f) => f.nombre as string));

    const archivos = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const archivo of archivos) {
      if (yaAplicadas.has(archivo)) continue;

      const sql = await readFile(path.join(MIGRATIONS_DIR, archivo), 'utf8');
      console.log(`[migrate] aplicando ${archivo}…`);

      await connection.beginTransaction();
      try {
        await connection.query(sql);
        await connection.query(
          'INSERT INTO schema_migrations (nombre) VALUES (?)',
          [archivo]
        );
        await connection.commit();
        aplicadas.push(archivo);
      } catch (error) {
        // Los DDL de MySQL hacen commit implícito, así que el rollback no
        // siempre deshace todo: por eso las migraciones usan IF NOT EXISTS.
        await connection.rollback();
        throw new Error(
          `Falló la migración ${archivo}: ${(error as Error).message}`,
          { cause: error }
        );
      }
    }

    if (aplicadas.length === 0) {
      console.log('[migrate] la base de datos ya estaba al día');
    } else {
      console.log(`[migrate] ${aplicadas.length} migración(es) aplicada(s)`);
    }

    return aplicadas;
  } finally {
    await connection.end();
  }
}

// Permite ejecutarlo como script: `tsx src/db/migrate.ts`
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error('[migrate]', error);
      process.exit(1);
    });
}
