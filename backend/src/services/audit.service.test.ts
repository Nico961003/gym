import { describe, expect, it } from 'vitest';
import { calcularCambios } from './audit.service.js';

describe('calcularCambios — el diff que se guarda en admin_logs', () => {
  it('devuelve solo los campos que cambiaron', () => {
    const diff = calcularCambios(
      { id: 1, nombre: 'Proteína', precio: 24.9, stock: 35 },
      { id: 1, nombre: 'Proteína', precio: 29.9, stock: 35 }
    );

    expect(diff).toEqual({
      precio: { antes: 24.9, despues: 29.9 },
    });
  });

  it('devuelve null si no cambió nada', () => {
    expect(calcularCambios({ a: 1 }, { a: 1 })).toBeNull();
  });

  it('devuelve null si no hay ni antes ni después', () => {
    expect(calcularCambios(null, null)).toBeNull();
  });

  it('en un alta registra solo el "después"', () => {
    const diff = calcularCambios(null, { id: 5, nombre: 'Nuevo' });
    expect(diff).toEqual({
      id: { despues: 5 },
      nombre: { despues: 'Nuevo' },
    });
  });

  it('en un borrado registra solo el "antes"', () => {
    const diff = calcularCambios({ id: 5, nombre: 'Viejo' }, null);
    expect(diff).toEqual({
      id: { antes: 5 },
      nombre: { antes: 'Viejo' },
    });
  });

  it('NUNCA incluye contraseñas ni tokens', () => {
    const diff = calcularCambios(
      { nombre: 'Ana', password: 'secreta', password_hash: '$2b$12$x' },
      { nombre: 'Ana María', password: 'otra', password_hash: '$2b$12$y' }
    );

    expect(diff).toEqual({ nombre: { antes: 'Ana', despues: 'Ana María' } });
    expect(JSON.stringify(diff)).not.toContain('secreta');
    expect(JSON.stringify(diff)).not.toContain('$2b$12$');
  });

  it('detecta cambios en campos anidados comparando el valor completo', () => {
    const diff = calcularCambios(
      { config: { activa: true } },
      { config: { activa: false } }
    );
    expect(diff).not.toBeNull();
  });
});
