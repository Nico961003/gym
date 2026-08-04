import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    // bcrypt con 12 rondas no es instantáneo y aquí se ejecuta de verdad.
    testTimeout: 30_000,
    hookTimeout: 30_000,
    // Contra una BD real, en serie: los tests comparten tablas.
    fileParallelism: false,
  },
});
