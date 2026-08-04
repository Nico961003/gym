import { describe, expect, it } from 'vitest';
import { failingRules, isPasswordValid, passwordRules } from './password';

/**
 * Estas reglas deben coincidir exactamente con las del backend
 * (`backend/src/validation/user.schema.ts`). Si cambian allí, estos tests
 * deberían fallar aquí.
 */
describe('reglas de contraseña en el frontend', () => {
  it('acepta contraseñas que cumplen las cuatro reglas', () => {
    for (const valida of ['Password1!', 'Abcdefg$', 'MiClave.Segura2026']) {
      expect(isPasswordValid(valida), valida).toBe(true);
    }
  });

  it('exige un mínimo de 8 caracteres', () => {
    expect(isPasswordValid('Ab1!def')).toBe(false);
    expect(isPasswordValid('Ab1!defg')).toBe(true);
  });

  it('exige mayúscula, minúscula y carácter especial', () => {
    expect(failingRules('password1!').map((r) => r.id)).toContain('uppercase');
    expect(failingRules('PASSWORD1!').map((r) => r.id)).toContain('lowercase');
    expect(failingRules('Password12').map((r) => r.id)).toContain('special');
  });

  it('no cuenta el espacio como carácter especial', () => {
    expect(failingRules('Password 12').map((r) => r.id)).toContain('special');
  });

  it('informa de todas las reglas incumplidas a la vez', () => {
    expect(failingRules('abc')).toHaveLength(3);
  });

  it('expone exactamente las cuatro reglas pedidas', () => {
    expect(passwordRules.map((r) => r.id)).toEqual([
      'length',
      'uppercase',
      'lowercase',
      'special',
    ]);
  });
});
