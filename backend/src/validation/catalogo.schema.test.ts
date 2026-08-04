import { describe, expect, it } from 'vitest';
import {
  adminUserUpdateSchema,
  productoSchema,
  promocionSchema,
} from './catalogo.schema.js';

const promoBase = {
  titulo: 'Matrícula gratis',
  descripcion: 'Te quitamos los 40 € de matrícula este mes.',
  tipo: 'IMPORTE_FIJO' as const,
  valor: 40,
  codigo: 'MATRI40',
  fechaInicio: '2026-08-01',
  fechaFin: '2026-09-30',
  activa: true,
  destacada: false,
};

describe('promocionSchema', () => {
  it('acepta una promoción válida', () => {
    expect(promocionSchema.safeParse(promoBase).success).toBe(true);
  });

  it('exige título y descripción con contenido', () => {
    expect(promocionSchema.safeParse({ ...promoBase, titulo: 'a' }).success).toBe(
      false
    );
    expect(
      promocionSchema.safeParse({ ...promoBase, descripcion: 'corta' }).success
    ).toBe(false);
  });

  it('rechaza que la fecha de fin sea anterior a la de inicio', () => {
    const result = promocionSchema.safeParse({
      ...promoBase,
      fechaInicio: '2026-09-30',
      fechaFin: '2026-08-01',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toMatch(/no puede ser anterior/i);
    }
  });

  it('rechaza un porcentaje mayor que 100', () => {
    expect(
      promocionSchema.safeParse({
        ...promoBase,
        tipo: 'PORCENTAJE',
        valor: 120,
      }).success
    ).toBe(false);

    expect(
      promocionSchema.safeParse({ ...promoBase, tipo: 'PORCENTAJE', valor: 50 })
        .success
    ).toBe(true);
  });

  it('rechaza valores negativos', () => {
    expect(promocionSchema.safeParse({ ...promoBase, valor: -5 }).success).toBe(
      false
    );
  });

  it('pasa el código a mayúsculas y rechaza símbolos raros', () => {
    const ok = promocionSchema.safeParse({ ...promoBase, codigo: 'verano-25' });
    expect(ok.success && ok.data.codigo).toBe('VERANO-25');

    expect(
      promocionSchema.safeParse({ ...promoBase, codigo: '¡oferta!' }).success
    ).toBe(false);
  });

  it('exige formato AAAA-MM-DD en las fechas', () => {
    expect(
      promocionSchema.safeParse({ ...promoBase, fechaInicio: '01/08/2026' })
        .success
    ).toBe(false);
  });

  it('solo admite los tipos previstos', () => {
    expect(
      promocionSchema.safeParse({ ...promoBase, tipo: 'REGALO' }).success
    ).toBe(false);
  });
});

describe('productoSchema', () => {
  const base = {
    nombre: 'Proteína whey 1 kg',
    precio: 24.9,
    stock: 35,
    fechaRegistro: '2026-08-01',
  };

  it('acepta un producto válido', () => {
    expect(productoSchema.safeParse(base).success).toBe(true);
  });

  it('acepta stock cero (producto agotado)', () => {
    expect(productoSchema.safeParse({ ...base, stock: 0 }).success).toBe(true);
  });

  it('rechaza precio o stock negativos', () => {
    expect(productoSchema.safeParse({ ...base, precio: -1 }).success).toBe(false);
    expect(productoSchema.safeParse({ ...base, stock: -1 }).success).toBe(false);
  });

  it('rechaza un stock decimal', () => {
    expect(productoSchema.safeParse({ ...base, stock: 1.5 }).success).toBe(false);
  });

  it('convierte los números que llegan como texto del formulario', () => {
    const result = productoSchema.safeParse({
      ...base,
      precio: '24.90',
      stock: '35',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.precio).toBe(24.9);
      expect(result.data.stock).toBe(35);
    }
  });
});

describe('adminUserUpdateSchema', () => {
  const base = {
    nombre: 'Ana',
    apellido: 'Ruiz',
    rol: 'CLIENT' as const,
    edad: 28,
    peso: 60,
    estatura: 1.65,
  };

  it('acepta los dos roles previstos', () => {
    expect(adminUserUpdateSchema.safeParse(base).success).toBe(true);
    expect(
      adminUserUpdateSchema.safeParse({ ...base, rol: 'ADMIN' }).success
    ).toBe(true);
  });

  it('rechaza un rol inventado', () => {
    expect(
      adminUserUpdateSchema.safeParse({ ...base, rol: 'SUPERADMIN' }).success
    ).toBe(false);
  });

  it('no permite cambiar el username ni la contraseña por esta vía', () => {
    const result = adminUserUpdateSchema.safeParse({
      ...base,
      username: 'otro',
      password: 'Password1!',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('username');
      expect(result.data).not.toHaveProperty('password');
    }
  });
});
