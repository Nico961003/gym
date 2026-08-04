import { describe, expect, it } from 'vitest';
import { toIsoDate } from './domain.js';

describe('toIsoDate', () => {
  it('formatea un Date como AAAA-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 7, 4))).toBe('2026-08-04');
  });

  it('rellena con ceros mes y día', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('usa la fecha local, no UTC (evita el desfase de un día)', () => {
    // 1 de enero a las 00:30 hora local: en UTC podría ser el 31 de diciembre.
    expect(toIsoDate(new Date(2026, 0, 1, 0, 30))).toBe('2026-01-01');
  });

  it('recorta la parte de hora si le llega una cadena', () => {
    expect(toIsoDate('2026-08-04 18:30:00')).toBe('2026-08-04');
    expect(toIsoDate('2026-08-04T18:30:00.000Z')).toBe('2026-08-04');
  });

  it('deja intacta una cadena que ya es AAAA-MM-DD', () => {
    expect(toIsoDate('2026-08-04')).toBe('2026-08-04');
  });
});
