import { defineConfig } from 'vitest/config';

/**
 * Ejecuta las dos suites en una sola pasada para poder medir la cobertura
 * combinada. Necesita MySQL levantado (`npm run db:up && npm run db:migrate`).
 *
 * El día a día sigue siendo `npm test` (unitarios, sin base de datos).
 */
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          globals: true,
          environment: 'node',
          include: ['src/**/*.test.ts'],
          setupFiles: ['./tests/setup.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          globals: true,
          environment: 'node',
          include: ['tests/integration/**/*.test.ts'],
          testTimeout: 30_000,
          hookTimeout: 30_000,
          fileParallelism: false,
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/server.ts',
        'src/db/migrate.ts',
        'src/types/**',
      ],
    },
  },
});
