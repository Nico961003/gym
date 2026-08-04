/**
 * Entorno para los tests unitarios. Se define antes de importar nada del
 * código de producción para que `config/env.ts` valide sin necesidad de .env
 * ni de una base de datos real.
 */
process.env.NODE_ENV = 'test';
process.env.PORT ??= '4001';
process.env.DB_HOST ??= '127.0.0.1';
process.env.DB_PORT ??= '3307';
process.env.DB_USER ??= 'test_user';
process.env.DB_PASSWORD ??= 'test_password';
process.env.DB_NAME ??= 'gym_test';
process.env.JWT_SECRET ??=
  'secreto-solo-para-tests-con-mas-de-32-caracteres-de-longitud';
process.env.JWT_EXPIRES_IN ??= '1h';
process.env.CORS_ORIGIN ??= 'http://localhost:3000';
// Los tests hacen muchas peticiones seguidas al mismo endpoint; el límite
// real se comprueba aparte, en rate-limit.test.ts.
process.env.AUTH_RATE_LIMIT_MAX ??= '10000';
