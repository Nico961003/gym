<h1 align="center">Rodriguez Gym</h1>

<p align="center">
  Sitio web de un gimnasio: portada pública, área de socio y panel de administración.
</p>

<p align="center">
  <a href="https://github.com/Nico961003/gym/actions/workflows/ci.yml">
    <img alt="CI" src="https://github.com/Nico961003/gym/actions/workflows/ci.yml/badge.svg">
  </a>
  <a href="https://github.com/Nico961003/gym/actions/workflows/deploy.yml">
    <img alt="Despliegue" src="https://github.com/Nico961003/gym/actions/workflows/deploy.yml/badge.svg">
  </a>
</p>

<p align="center">
  <a href="https://nico961003.github.io/gym/">
    <img src="docs/img/portada.jpg" alt="Portada de Rodriguez Gym" width="100%">
  </a>
</p>

<p align="center">
  <a href="https://nico961003.github.io/gym/"><strong>🔗 Ver sitio en vivo</strong></a>
</p>

Monorepo con dos proyectos independientes.

> **Todo el contenido es ficticio.** Nombres, precios, sedes, personas y
> testimonios son de relleno para la maqueta. Ver [Licencia](#licencia).

> **Qué se ve en el sitio publicado.** GitHub Pages solo sirve archivos
> estáticos, así que allí está **únicamente el frontend**: se ve toda la
> portada (sedes, horarios, clases, tarifas, equipo y testimonios), pero el
> acceso, el registro, las promociones en vivo y el panel de administración
> necesitan la API, que no está desplegada, y avisan de ello. Para verlo
> entero hay que [levantarlo en local](#puesta-en-marcha), que sí incluye
> backend y base de datos.
>
> Cuando la API esté publicada, basta con crear la variable de repositorio
> `API_URL` (*Settings › Secrets and variables › Actions › Variables*) con su
> URL: el siguiente despliegue la usará sin tocar el código.

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

## Despliegue

El frontend se publica en GitHub Pages con
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) en cada push a
`main`.

Si clonas este repositorio en otra cuenta, hay **un paso manual ineludible**:
activar Pages en *Settings › Pages › Build and deployment › Source →
**GitHub Actions***. No se puede automatizar: crear el sitio por API exige
permisos de administración que el `GITHUB_TOKEN` de Actions no tiene, y el
workflow falla con `Resource not accessible by integration`.

El backend no se despliega ahí —Pages solo sirve archivos estáticos—. Cuando
lo publiques en algún sitio que ejecute Node y MySQL (Render, Railway, un VPS
con el `docker-compose`…), crea la variable de repositorio `API_URL` con su
dirección: el siguiente despliegue la usará sin tocar código.

## Documentación

- [backend/README.md](backend/README.md) — API, roles, migraciones, seed y el
  diseño de la tabla de auditoría.
- [frontend/README.md](frontend/README.md) — rutas, convención de tests y
  decisiones sobre Bootstrap.

## Licencia

Código y estilos: propios.

**Fotografías**: de [Pexels](https://www.pexels.com), bajo su
[licencia](https://www.pexels.com/license/) — uso libre, también comercial y
sin atribución obligatoria. El detalle de cada una está en
[frontend/src/assets/img/CREDITOS.md](frontend/src/assets/img/CREDITOS.md).

Las personas que aparecen en las fotos no tienen relación con este sitio: los
nombres, cargos y testimonios que las acompañan son inventados.
