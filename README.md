# Rodriguez Gym

Sitio web de un gimnasio: portada pública, área de socio y panel de
administración. Monorepo con dos proyectos independientes.

> **Todo el contenido es ficticio.** Nombres, precios, sedes, personas y
> testimonios son de relleno para la maqueta. Ver [Licencia](#licencia).

| | |
| --- | --- |
| **frontend/** | React 19 · TypeScript 6 · Vite 8 · Bootstrap 5.3 · React Router 8 |
| **backend/** | Express 5 · TypeScript 6 · MySQL 26.7 (Docker) · Zod 4 · JWT |
| **Tests** | 462 (191 backend · 271 frontend) · Vitest + Testing Library + supertest |

## Puesta en marcha

Requiere **Node.js >= 22.22.2** y **Docker**.

```bash
# Backend: base de datos + migraciones + administrador inicial
cd backend
cp .env.example .env        # y cambia los valores
npm install
npm run db:setup            # docker compose up + migraciones + seed
npm run dev                 # API en http://localhost:4000

# Frontend, en otra terminal
cd frontend
cp .env.example .env
npm install
npm run dev                 # sitio en http://localhost:3000
```

### Cuentas de ejemplo

| Usuario | Contraseña | Rol | Aterriza en |
| --- | --- | --- | --- |
| `admin` | `Password_123` | ADMIN | `/admin` — CRUD y registro de actividad |
| `demo` | `Password1!` | CLIENT | `/mi-cuenta` — membresía y asistencias |

El administrador lo crea el propio backend al arrancar
(`backend/src/db/seed.ts`); es idempotente y no pisa una contraseña existente.

## Qué hay dentro

**Público** — portada con sedes, horarios, clases, tarifas, promociones
en vivo desde la API e invitación a hacerse socio.

**Socio** (`CLIENT`) — plan contratado, fecha de alta, próximo pago,
asistencias del mes y del año, historial y promociones vigentes.

**Administración** (`ADMIN`) — CRUD de promociones, productos y usuarios, más
un registro de actividad con el detalle de cada cambio.

## Seguridad

- Contraseñas con **bcrypt** (12 rondas). La tabla solo guarda el hash.
- Reglas de contraseña: 8+ caracteres, mayúscula, minúscula y carácter
  especial. Se validan en el servidor; el frontend las replica solo para dar
  feedback mientras se escribe.
- **SQL siempre parametrizado**, sin concatenación.
- El **rol se lee de la base de datos en cada petición**, no del JWT: revocar
  permisos tiene efecto inmediato.
- Login sin fugas: usuario inexistente y contraseña incorrecta devuelven el
  mismo mensaje y tardan lo mismo.
- Rate limiting en `/api/auth`, `helmet` y CORS restringido.
- Los `.env` están fuera del repositorio; solo se versionan los `.env.example`.

Lo que falta para producción está anotado en
[backend/README.md](backend/README.md#pendiente-si-esto-va-a-producción).

## Comandos

```bash
# backend/
npm run dev              npm test                 # unitarios, sin BD
npm run db:setup         npm run test:integration # contra MySQL
npm run db:migrate       npm run test:all         # ambas suites
npm run db:seed          npm run test:coverage
npm run lint             npm run typecheck

# frontend/
npm run dev              npm test
npm run build            npm run test:coverage
npm run lint             npm run typecheck
```

## Documentación

- [backend/README.md](backend/README.md) — API, roles, migraciones, seed y el
  diseño de la tabla de auditoría.
- [frontend/README.md](frontend/README.md) — rutas, convención de tests y
  decisiones sobre Bootstrap.

## Licencia

Código y estilos: propios.

Las **fotografías** proceden de la plantilla *Gymnast* de
[HTML Codex](https://htmlcodex.com/gym-website-template) y se rigen por
[su licencia](https://htmlcodex.com/license). Si vas a reutilizar este
repositorio, sustitúyelas por imágenes propias.
