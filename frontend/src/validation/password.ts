/**
 * Reglas de contraseña replicadas del backend
 * (`backend/src/validation/user.schema.ts`).
 *
 * Aquí sirven para dar feedback inmediato mientras se escribe; la validación
 * que manda sigue siendo la del servidor, porque esta se puede saltar.
 */
export interface PasswordRule {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

export const PASSWORD_MIN_LENGTH = 8;

export const passwordRules: PasswordRule[] = [
  {
    id: 'length',
    label: `Al menos ${PASSWORD_MIN_LENGTH} caracteres`,
    test: (v) => v.length >= PASSWORD_MIN_LENGTH,
  },
  {
    id: 'uppercase',
    label: 'Una letra mayúscula',
    test: (v) => /[A-ZÁÉÍÓÚÑ]/.test(v),
  },
  {
    id: 'lowercase',
    label: 'Una letra minúscula',
    test: (v) => /[a-záéíóúñ]/.test(v),
  },
  {
    id: 'special',
    label: 'Un carácter especial (!, @, #, $…)',
    test: (v) => /[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]/.test(v),
  },
];

/** Devuelve las reglas que la contraseña todavía no cumple. */
export function failingRules(value: string): PasswordRule[] {
  return passwordRules.filter((rule) => !rule.test(value));
}

export function isPasswordValid(value: string): boolean {
  return failingRules(value).length === 0;
}
