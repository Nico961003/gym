/**
 * Punto de entrada del seed como script suelto.
 *
 *   npm run db:seed              crea el administrador si no existe
 *   npm run db:seed -- --force   además restablece su contraseña
 */
import { closePool } from './pool.js';
import { seedAdmin } from './seed.js';

const forzarPassword = process.argv.includes('--force');

seedAdmin({ forzarPassword })
  .then(async (resultado) => {
    if (resultado.accion === 'sin-cambios') {
      console.log(
        '[seed] usa "npm run db:seed -- --force" si quieres restablecer la contraseña'
      );
    }
    await closePool();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('[seed] no se pudo dar de alta al administrador:', error);
    await closePool();
    process.exit(1);
  });
