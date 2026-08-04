/**
 * Alta del administrador inicial.
 *
 * Se ejecuta solo al arrancar el servidor (ver `server.ts`) y también a mano:
 *
 *   npm run db:seed            crea el admin si no existe
 *   npm run db:seed -- --force ADEMÁS restablece su contraseña
 *
 * Es idempotente: si el usuario ya existe NO se toca su contraseña, porque
 * pisarla en cada arranque anularía cualquier cambio que hubiese hecho la
 * persona que lo usa. Para eso está `--force`, que es una decisión explícita.
 *
 * Las credenciales salen de `.env` (ADMIN_USERNAME, ADMIN_PASSWORD…), con
 * valores por defecto pensados para desarrollo.
 */
import { env } from '../config/env.js';
import * as membresiaRepository from '../repositories/membresia.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import { hashPassword } from '../utils/password.js';
import { passwordSchema, usernameSchema } from '../validation/user.schema.js';

/** Contraseña de ejemplo; sirve para desarrollo, no para producción. */
const PASSWORD_POR_DEFECTO = 'Password_123';

export type AccionSeed = 'creado' | 'sin-cambios' | 'password-restablecida';

export interface ResultadoSeed {
  accion: AccionSeed;
  username: string;
  id: number;
}

export interface OpcionesSeed {
  /** Restablece la contraseña aunque el usuario ya exista. */
  forzarPassword?: boolean;
  /** Poner a false para no imprimir nada (tests). */
  verbose?: boolean;
}

/**
 * Garantiza que existe un usuario con rol ADMIN.
 * No lanza si el usuario ya está: devuelve `sin-cambios`.
 */
export async function seedAdmin({
  forzarPassword = false,
  verbose = true,
}: OpcionesSeed = {}): Promise<ResultadoSeed> {
  const log = (mensaje: string) => {
    if (verbose) console.log(`[seed] ${mensaje}`);
  };

  // Las credenciales vienen de fuera: se validan igual que las de un alta
  // normal, para que un .env descuidado no cuele un usuario inválido.
  const username = usernameSchema.parse(env.ADMIN_USERNAME);
  const password = passwordSchema.parse(env.ADMIN_PASSWORD);

  if (password === PASSWORD_POR_DEFECTO && env.NODE_ENV === 'production') {
    console.warn(
      '[seed] AVISO: el administrador usa la contraseña de ejemplo en ' +
        'producción. Define ADMIN_PASSWORD en el .env.'
    );
  }

  const existente = await userRepository.findByUsername(username);

  if (existente) {
    // Si alguien le quitó el rol por error, se lo devolvemos.
    if (existente.rol !== 'ADMIN') {
      await userRepository.update(existente.id, {
        nombre: existente.nombre,
        apellido: existente.apellido,
        rol: 'ADMIN',
        edad: existente.edad,
        peso: Number(existente.peso),
        estatura: Number(existente.estatura),
      });
      log(`«${username}» ya existía; se le ha restituido el rol ADMIN`);
    }

    if (!forzarPassword) {
      log(`«${username}» ya existe: no se toca su contraseña`);
      return { accion: 'sin-cambios', username, id: existente.id };
    }

    await userRepository.updatePassword(
      existente.id,
      await hashPassword(password)
    );
    log(`contraseña de «${username}» restablecida`);
    return { accion: 'password-restablecida', username, id: existente.id };
  }

  const creado = await userRepository.create({
    username,
    nombre: env.ADMIN_NOMBRE,
    apellido: env.ADMIN_APELLIDO,
    rol: 'ADMIN',
    edad: 30,
    peso: 75,
    estatura: 1.75,
    passwordHash: await hashPassword(password),
  });

  await membresiaRepository.createForUsuario(creado.id, 'PREMIUM');

  log(`administrador «${username}» creado (id ${creado.id})`);
  if (password === PASSWORD_POR_DEFECTO) {
    log('recuerda cambiar la contraseña por defecto');
  }

  return { accion: 'creado', username, id: creado.id };
}
