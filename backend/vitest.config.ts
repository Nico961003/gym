import { defineConfig } from 'vitest/config';

/**
 * Tests unitarios: viven junto al módulo que prueban (`src/**‍/*.test.ts`) y
 * no tocan la base de datos. Los de integración se lanzan aparte con
 * `npm run test:integration` (vitest.integration.config.ts).
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./tests/setup.ts'],
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
