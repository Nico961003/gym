import { describe, expect, it } from 'vitest';
import { toPublicUser, type UserRow } from './user.js';

const fila: UserRow = {
  id: 7,
  username: 'martagil',
  nombre: 'Marta',
  apellido: 'Gil',
  rol: 'CLIENT',
  edad: 32,
  // MySQL devuelve los DECIMAL como cadena para no perder precisión.
  peso: '62.50',
  estatura: '1.68',
  password_hash: '$2b$12$hashsecreto',
  created_at: new Date('2026-01-15T10:30:00Z'),
  updated_at: new Date('2026-02-01T10:30:00Z'),
};

describe('toPublicUser', () => {
  it('NUNCA expone el hash de la contraseña', () => {
    const publico = toPublicUser(fila);
    expect(publico).not.toHaveProperty('password_hash');
    expect(JSON.stringify(publico)).not.toContain('$2b$');
  });

  it('convierte los DECIMAL de MySQL a número', () => {
    const publico = toPublicUser(fila);
    expect(publico.peso).toBe(62.5);
    expect(publico.estatura).toBe(1.68);
    expect(typeof publico.peso).toBe('number');
  });

  it('acepta también valores ya numéricos', () => {
    const publico = toPublicUser({ ...fila, peso: 80, estatura: 1.8 });
    expect(publico.peso).toBe(80);
    expect(publico.estatura).toBe(1.8);
  });

  it('devuelve la fecha de alta en ISO', () => {
    expect(toPublicUser(fila).createdAt).toBe('2026-01-15T10:30:00.000Z');
  });

  it('conserva el rol', () => {
    expect(toPublicUser(fila).rol).toBe('CLIENT');
    expect(toPublicUser({ ...fila, rol: 'ADMIN' }).rol).toBe('ADMIN');
  });

  it('no arrastra las marcas internas de actualización', () => {
    expect(toPublicUser(fila)).not.toHaveProperty('updated_at');
  });
});
