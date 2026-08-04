import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages publica el sitio en /<repositorio>/, no en la raíz del
  // dominio. BASE_PATH lo inyecta el workflow de despliegue; en desarrollo
  // se queda en «/».
  base: process.env.BASE_PATH ?? '/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'build',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Sin procesar CSS: ningún test comprueba estilos calculados (los que
    // miran clases leen el atributo `class`), y transformar los 238 kB de
    // Bootstrap en cada archivo multiplicaba el tiempo de ejecución.
    css: false,
    // Margen holgado: jsdom + React son lentos, y con la instrumentación de
    // cobertura más todavía.
    testTimeout: 30_000,
    // Cada worker levanta su propio jsdom. Con todos los núcleos a la vez la
    // máquina se satura y los tests que montan la app entera se pasaban del
    // plazo de forma intermitente; con la mitad, la suite es estable y no
    // tarda apreciablemente más.
    maxWorkers: '50%',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/main.tsx',
        'src/test/**',
        'src/types/**',
        'src/api/types.ts',
        'src/vite-env.d.ts',
        'src/reportWebVitals.ts',
      ],
    },
  },
});
