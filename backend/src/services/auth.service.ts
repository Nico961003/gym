import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import * as membresiaRepository from '../repositories/membresia.repository.js';
import * as userRepository from '../repositories/user.repository.js';
import { toPublicUser, type PublicUser } from '../types/user.js';
import { conflict, unauthorized } from '../utils/errors.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import type { LoginInput, RegisterInput } from '../validation/user.schema.js';

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export interface TokenPayload {
  sub: number;
  username: string;
}

function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (
    typeof decoded === 'string' ||
    typeof decoded.sub !== 'number' ||
    typeof decoded.username !== 'string'
  ) {
    throw unauthorized('Token inválido');
  }
  return { sub: decoded.sub, username: decoded.username };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  if (await userRepository.existsByUsername(input.username)) {
    throw conflict('Ese nombre de usuario ya está registrado');
  }

  const passwordHash = await hashPassword(input.password);
  const row = await userRepository.create({
    username: input.username,
    nombre: input.nombre,
    apellido: input.apellido,
    edad: input.edad,
    peso: input.peso,
    estatura: input.estatura,
    passwordHash,
  });

  const user = toPublicUser(row);

  // Todo cliente nuevo arranca con su membresía básica activa.
  await membresiaRepository.createForUsuario(user.id);

  return { user, token: signToken({ sub: user.id, username: user.username }) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const row = await userRepository.findByUsername(input.username);

  // Si el usuario no existe también comparamos contra un hash ficticio, para
  // que el tiempo de respuesta no delate qué usuarios están registrados.
  if (!row) {
    await verifyPassword(
      input.password,
      '$2b$12$0000000000000000000000000000000000000000000000000000'
    );
    throw unauthorized();
  }

  if (!(await verifyPassword(input.password, row.password_hash))) {
    throw unauthorized();
  }

  const user = toPublicUser(row);
  return { user, token: signToken({ sub: user.id, username: user.username }) };
}

export async function getProfile(userId: number): Promise<PublicUser> {
  const row = await userRepository.findById(userId);
  if (!row) {
    throw unauthorized('La sesión ya no es válida');
  }
  return toPublicUser(row);
}
