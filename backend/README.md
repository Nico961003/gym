# Backend — Rodriguez Gym

API REST en Node.js + Express 5 + TypeScript, con MySQL en Docker.

## Stack

| Pieza | Versión |
| --- | --- |
| MySQL (Docker) | 26.7 |
| Node.js | >= 22 |
| Express | 5 |
| TypeScript | 6 |
| mysql2 | 3 |
| Zod (validación) | 4 |
| bcryptjs (hash) | 3 |
| jsonwebtoken | 9 |
| Vitest + supertest | 4 / 7 |

## Puesta en marcha

```bash
cp .env.example .env      # y cambia TODOS los valores
npm install
npm run db:setup          # levanta MySQL + migra + crea el administrador
npm run dev               # API en http://localhost:4000
```

## Administrador inicial

Al arrancar, el backend comprueba que existe un usuario con rol `ADMIN` y lo
crea si falta (`src/db/seed.ts`). Las credenciales salen del `.env`:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Password_123
```

**Es idempotente y no pisa una contraseña existente.** Si el usuario ya está,
el seed lo deja como está: restablecerla en cada arranque anularía cualquier
cambio que hubiese hecho su dueño. Para cambiarla hace falta pedirlo:

```bash
npm run db:seed              # crea el admin si no existe
npm run db:seed -- --force   # ADEMÁS restablece su contraseña a ADMIN_PASSWORD
```

Otros detalles:

- La contraseña se valida con las **mismas reglas** que un alta normal, así
  que un `.env` descuidado no puede colar una débil: el arranque falla con un
  mensaje claro.
- Si al usuario le hubieran quitado el rol, el seed se lo devuelve.
- `SEED_ON_START=false` desactiva la siembra automática. En producción tiene
  sentido: se lanza `npm run db:seed` una vez, a mano.
- La contraseña por defecto solo sirve para desarrollo; si se usa con
  `NODE_ENV=production`, el arranque lo avisa por consola.

El esquema (`db/init/01-schema.sql`) lo ejecuta Docker **solo la primera vez**,
cuando el volumen está vacío. Si cambias el SQL, recrea el volumen:

```bash
npm run db:reset          # docker compose down -v && up -d  (BORRA LOS DATOS)
```

Genera el `JWT_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Scripts

```bash
npm run dev              # servidor con recarga (tsx watch)
npm run build            # compila a dist/
npm start                # ejecuta dist/server.js
npm test                 # tests unitarios (NO necesitan base de datos)
npm run test:integration # tests contra MySQL real (necesita db:up)
npm run lint
npm run typecheck
npm run db:up / db:down / db:reset / db:logs
```

## Migraciones

El esquema vive en `db/migrations/*.sql` y lo aplica un runner propio que
anota lo ejecutado en `schema_migrations`, así que es idempotente:

```bash
npm run db:migrate
```

Para añadir un cambio, crea `db/migrations/00N_lo_que_sea.sql` y vuelve a
lanzarlo. **No edites una migración ya aplicada**: crea otra nueva.

## Roles

| Rol | Puede |
| --- | --- |
| `CLIENT` | Ver la web, su membresía, sus asistencias y las promociones |
| `ADMIN` | Todo lo anterior **más** el CRUD de promociones, productos y usuarios, y el registro de actividad |

Quien se registra es `CLIENT`. El rol se otorga desde el panel de
administración o directamente en la base de datos.

`requireRole` lee el rol **de la base de datos en cada petición**, no del JWT:
si a alguien se le retira el rol de administrador, pierde el acceso al
instante en lugar de conservarlo hasta que caduque su token.

## Endpoints

| Método | Ruta | Auth | Descripción |
| --- | --- | --- | --- |
| `GET` | `/api/health` | — | Estado de la API y de la BD |
| `POST` | `/api/auth/register` | — | Alta de usuario (siempre `CLIENT`) |
| `POST` | `/api/auth/login` | — | Devuelve `{ user, token }` |
| `GET` | `/api/auth/me` | Bearer | Perfil del usuario del token |
| `GET` | `/api/publico/promociones` | — | Promociones vigentes |
| `GET` | `/api/publico/productos` | — | Catálogo de la tienda |
| `GET` | `/api/cliente/panel` | Bearer | Membresía, asistencias y promociones |
| `POST` | `/api/cliente/asistencias` | Bearer | Registra una visita de hoy |
| `GET/POST/PUT/DELETE` | `/api/admin/promociones[/:id]` | ADMIN | CRUD de promociones |
| `GET/POST/PUT/DELETE` | `/api/admin/productos[/:id]` | ADMIN | CRUD de productos |
| `GET/PUT/DELETE` | `/api/admin/usuarios[/:id]` | ADMIN | Gestión de usuarios |
| `GET` | `/api/admin/logs` | ADMIN | Registro de actividad |

### Campos de las promociones

`titulo`, `descripcion`, `tipo` (`PORCENTAJE` · `IMPORTE_FIJO` ·
`MESES_GRATIS` · `OTRO`), `valor`, `codigo` (único, opcional),
`fechaInicio`, `fechaFin`, `activa`, `destacada`.

`tipo` + `valor` van juntos a propósito: guardar «-20%» como texto obligaría a
parsear la cadena para calcular nada. Con el tipo aparte, el importe se puede
computar, y el frontend genera la etiqueta que se ve en pantalla.
`destacada` decide qué sale en portada; `activa` + fechas deciden qué se
considera vigente.

## Tabla de auditoría (`admin_logs`)

Registra los movimientos de los administradores. Cinco decisiones para que no
se dispare de tamaño:

1. **Solo escrituras y accesos.** Las lecturas son el 90% del tráfico de un
   panel y no aportan nada a una auditoría. Hay un test que lo comprueba.
2. **`accion` y `entidad` son `ENUM`** (1 byte) en vez de `VARCHAR`.
3. **`cambios` guarda solo el diff**, no el registro entero:
   `{"precio":{"antes":10,"despues":12}}`. El backend lo trunca a 2 KB y filtra
   contraseñas y tokens antes de escribir.
4. **La IP se guarda como `VARBINARY(16)`** con `INET6_ATON`: 16 bytes en vez
   de los 45 de un `VARCHAR`.
5. **Retención de 180 días** mediante un evento de MySQL que purga cada noche
   en lotes de 5.000 filas (requiere `event-scheduler=ON`, ya activado en el
   compose).

Con ~200 escrituras al día son unos 25 MB en 180 días. Si algún día se queda
corto, el siguiente paso natural es particionar por mes y archivar los
trimestres cerrados.

`admin_username` está desnormalizado a propósito: si se borra al
administrador, el registro debe seguir siendo legible.

### Reglas de la contraseña

Definidas en `src/validation/user.schema.ts` y replicadas en el frontend
(`frontend/src/validation/password.ts`) solo para dar feedback en vivo:

- mínimo 8 caracteres (máximo 72, límite de bcrypt)
- al menos una letra mayúscula
- al menos una letra minúscula
- al menos un carácter especial (ni letra, ni dígito, ni espacio)

El servidor devuelve `400` con **todas** las reglas incumplidas a la vez:

```json
{
  "error": "Los datos enviados no son válidos",
  "detalles": [
    { "campo": "password", "mensaje": "La contraseña debe contener al menos una letra mayúscula" },
    { "campo": "password", "mensaje": "La contraseña debe contener al menos un carácter especial" }
  ]
}
```

## Estructura y convención de tests

Se usa **co-location para los tests unitarios** (cada `*.test.ts` vive junto
al módulo que prueba) y una **carpeta aparte para los de integración**, que
son los únicos que necesitan MySQL levantado.

```
docker-compose.yml            MySQL 26.7 + volumen + healthcheck
db/init/01-schema.sql         CREATE DATABASE gym
db/migrations/*.sql           esquema versionado
src/
  server.ts                   arranque y apagado ordenado
  app.ts        app.test.ts   monta Express (separado para poder testearlo)
  config/       env.ts        + env.test.ts
  db/           pool.ts, migrate.ts
  types/        user.ts, domain.ts (+ sus .test.ts)
  utils/        errors.ts, password.ts (+ sus .test.ts)
  validation/   *.schema.ts (+ sus .test.ts)
  repositories/ SQL parametrizado
  services/     lógica de negocio (+ sus .test.ts)
  controllers/  adaptan HTTP <-> servicios
  middleware/   validación, auth, roles, errores (+ sus .test.ts)
  routes/       definición de rutas (+ sus .test.ts)
tests/
  setup.ts                    variables de entorno para los unitarios
  integration/*.test.ts       contra MySQL real
```

**Por qué así:** el test se ve al lado del código, se mueve con él y se borra
con él, y basta abrir la carpeta para saber qué está cubierto y qué no. Los de
integración se separan porque tienen otro requisito de ejecución (una base de
datos), otro tiempo y otra configuración (`vitest.integration.config.ts`).

Los repositorios y controladores no tienen test unitario propio a propósito:
son SQL y fontanería HTTP, y se prueban de verdad en `tests/integration/`.
Un doble de `mysql2` solo comprobaría que el mock devuelve lo que le hemos
dicho.

```bash
npm test                  # unitarios (sin BD)
npm run test:integration  # contra MySQL (necesita db:up + db:migrate)
npm run test -- --coverage
```

## Decisiones de seguridad

- **La contraseña nunca se guarda en claro.** La tabla solo tiene
  `password_hash` (bcrypt, 12 rondas). Hay tests que lo comprueban tanto en el
  JSON de respuesta como en la propia tabla de MySQL.
- **SQL siempre parametrizado** (`?`), sin concatenación de cadenas.
- **Login sin fugas de información**: un usuario inexistente y una contraseña
  incorrecta devuelven el mismo mensaje, y en el primer caso se compara igual
  contra un hash ficticio para que el tiempo de respuesta no delate qué
  usuarios existen.
- **Rate limiting** en `/api/auth` (20 intentos / 15 min, configurable con
  `AUTH_RATE_LIMIT_MAX`) contra fuerza bruta.
- **`helmet`** para las cabeceras de seguridad y **CORS** restringido a
  `CORS_ORIGIN`.
- **El `.env` está en `.gitignore`.** Solo se versiona `.env.example`.

### Pendiente si esto va a producción

- El token viaja en `localStorage` del navegador, expuesto a XSS. Una cookie
  `httpOnly` + `SameSite` sería más segura, a cambio de configurar CSRF.
- No hay refresh tokens: cuando el JWT caduca (2 h) hay que volver a entrar.
- No hay roles ni permisos: cualquier usuario autenticado es equivalente.
- Falta HTTPS (terminación TLS en el proxy que haya delante).
