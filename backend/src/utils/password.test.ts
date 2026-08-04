import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';

describe('hash de contraseñas', () => {
  it('no devuelve nunca la contraseña en claro', async () => {
    const plain = 'Password1!';
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(hash).not.toContain(plain);
  });

  it('genera un hash bcrypt con 12 rondas', async () => {
    const hash = await hashPassword('Password1!');
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
  });

  it('produce hashes distintos para la misma contraseña (salt aleatorio)', async () => {
    const [a, b] = await Promise.all([
      hashPassword('Password1!'),
      hashPassword('Password1!'),
    ]);
    expect(a).not.toBe(b);
  });

  it('verifica correctamente la contraseña buena', async () => {
    const hash = await hashPassword('Password1!');
    await expect(verifyPassword('Password1!', hash)).resolves.toBe(true);
  });

  it('rechaza una contraseña incorrecta', async () => {
    const hash = await hashPassword('Password1!');
    await expect(verifyPassword('Password1?', hash)).resolves.toBe(false);
    await expect(verifyPassword('password1!', hash)).resolves.toBe(false);
    await expect(verifyPassword('', hash)).resolves.toBe(false);
  });
});
