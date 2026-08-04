import { describe, expect, it } from 'vitest';
import {
  passwordSchema,
  registerSchema,
  usernameSchema,
} from './user.schema.js';

/** Extrae los mensajes de error de un parseo fallido. */
function mensajes(input: unknown): string[] {
  const result = passwordSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.message);
}

describe('passwordSchema — reglas exigidas', () => {
  it('acepta una contraseña que cumple las cuatro reglas', () => {
    for (const valida of [
      'Password1!',
      'Abcdefg$',
      'MiClave.Segura2026',
      'aB3#efgh',
      'Ñandú_Fuerte1',
    ]) {
      expect(passwordSchema.safeParse(valida).success, valida).toBe(true);
    }
  });

  it('rechaza contraseñas de menos de 8 caracteres', () => {
    expect(mensajes('Ab1!def')).toContain(
      'La contraseña debe tener al menos 8 caracteres'
    );
    expect(passwordSchema.safeParse('Ab1!defg').success).toBe(true);
  });

  it('rechaza si no hay ninguna mayúscula', () => {
    expect(mensajes('password1!')).toContain(
      'La contraseña debe contener al menos una letra mayúscula'
    );
  });

  it('rechaza si no hay ninguna minúscula', () => {
    expect(mensajes('PASSWORD1!')).toContain(
      'La contraseña debe contener al menos una letra minúscula'
    );
  });

  it('rechaza si no hay ningún carácter especial', () => {
    expect(mensajes('Password12')).toContain(
      'La contraseña debe contener al menos un carácter especial'
    );
  });

  it('no considera especial ni a las letras ni a los dígitos ni al espacio', () => {
    expect(passwordSchema.safeParse('Password 12').success).toBe(false);
  });

  it('acepta distintos caracteres especiales', () => {
    for (const especial of '!@#$%^&*()-_=+[]{};:,.<>?/|\\~`\'"') {
      const clave = `Abcdefg${especial}`;
      expect(passwordSchema.safeParse(clave).success, clave).toBe(true);
    }
  });

  it('acumula todos los errores cuando falla más de una regla', () => {
    const errores = mensajes('abc');
    expect(errores).toHaveLength(3);
    expect(errores).toEqual(
      expect.arrayContaining([
        'La contraseña debe tener al menos 8 caracteres',
        'La contraseña debe contener al menos una letra mayúscula',
        'La contraseña debe contener al menos un carácter especial',
      ])
    );
  });

  it('rechaza contraseñas de más de 72 caracteres (límite de bcrypt)', () => {
    expect(passwordSchema.safeParse(`Aa1!${'x'.repeat(80)}`).success).toBe(
      false
    );
  });

  it('rechaza valores que no son texto', () => {
    for (const invalido of [null, undefined, 12345678, {}, []]) {
      expect(passwordSchema.safeParse(invalido).success).toBe(false);
    }
  });
});

describe('usernameSchema', () => {
  it('acepta nombres de usuario válidos', () => {
    for (const v of ['ana', 'carlos_r', 'user.name-99']) {
      expect(usernameSchema.safeParse(v).success, v).toBe(true);
    }
  });

  it('rechaza menos de 3 caracteres y caracteres no permitidos', () => {
    expect(usernameSchema.safeParse('ab').success).toBe(false);
    expect(usernameSchema.safeParse('con espacio').success).toBe(false);
    expect(usernameSchema.safeParse('email@dominio').success).toBe(false);
  });

  it('recorta los espacios sobrantes', () => {
    const result = usernameSchema.safeParse('  martagil  ');
    expect(result.success && result.data).toBe('martagil');
  });
});

describe('registerSchema — resto de campos', () => {
  const base = {
    username: 'martagil',
    nombre: 'Marta',
    apellido: 'Gil',
    edad: 32,
    peso: 62.5,
    estatura: 1.68,
    password: 'Password1!',
  };

  it('acepta un alta completa y correcta', () => {
    const result = registerSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('convierte números enviados como texto (formularios HTML)', () => {
    const result = registerSchema.safeParse({
      ...base,
      edad: '32',
      peso: '62.5',
      estatura: '1.68',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.edad).toBe(32);
      expect(result.data.peso).toBe(62.5);
      expect(result.data.estatura).toBe(1.68);
    }
  });

  it('aplica los límites de edad, peso y estatura', () => {
    expect(registerSchema.safeParse({ ...base, edad: 13 }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, edad: 121 }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, edad: 32.5 }).success).toBe(
      false
    );
    expect(registerSchema.safeParse({ ...base, peso: 29 }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, peso: 401 }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, estatura: 0.9 }).success).toBe(
      false
    );
    expect(registerSchema.safeParse({ ...base, estatura: 2.7 }).success).toBe(
      false
    );
  });

  it('exige nombre y apellido', () => {
    expect(registerSchema.safeParse({ ...base, nombre: '' }).success).toBe(
      false
    );
    expect(registerSchema.safeParse({ ...base, apellido: 'X' }).success).toBe(
      false
    );
  });

  it('rechaza el alta si la contraseña no cumple las reglas', () => {
    const result = registerSchema.safeParse({ ...base, password: 'debil' });
    expect(result.success).toBe(false);
  });
});
