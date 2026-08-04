# Rodriguez Gym — frontend

Landing page de un gimnasio, construida con React + TypeScript sobre Bootstrap 5.

> **Todo el contenido es ficticio.** Nombres, precios, dirección, teléfono y
> testimonios son de relleno y viven en `src/data/gym.ts`. Sustitúyelos antes de
> publicar nada.

Las fotografías proceden de la plantilla *Gymnast* de
[HTML Codex](https://htmlcodex.com/gym-website-template) (ver
`../../Maquetacion/LICENSE.txt`). El resto del código y los estilos son propios.

## Stack

| Herramienta | Versión |
| --- | --- |
| React | 19 |
| TypeScript | 6 |
| Vite | 8 |
| Bootstrap | 5.3.8 |
| Vitest + Testing Library | 4 / 16 |
| ESLint (flat config) + typescript-eslint | 10 / 8 |

Requiere **Node.js >= 22.22.2** (lo exige jsdom, usado por los tests).

## Rutas

| Ruta | Acceso | Contenido |
| --- | --- | --- |
| `/` | Público | Portada: sedes, horarios, clases, tarifas, promociones, invitación a hacerse socio |
| `/acceder` | Público | Inicio de sesión |
| `/registro` | Público | Alta de socio |
| `/mi-cuenta` | Con sesión | Membresía, próximo pago, asistencias y promociones |
| `/admin/*` | Solo `ADMIN` | CRUD de promociones, productos y usuarios + registro de actividad |

La portada es **pública**: el navbar ofrece «Acceder» y «Registrarse» cuando no
hay sesión, y «Mi cuenta» / «Administración» / «Salir» cuando la hay. Tras
iniciar sesión, un `ADMIN` aterriza en `/admin` y un `CLIENT` en `/mi-cuenta`.

`ProtectedRoute` es una comodidad de navegación, **no una medida de
seguridad**: quien llame a la API a mano se la salta. Lo que protege los datos
de verdad es `requireRole` en el backend.

## Puesta en marcha

Necesita el backend arrancado (`../backend`, ver su README):

```bash
cd ../backend && npm run db:up && npm run dev   # MySQL + API en :4000
cd ../frontend && npm run dev                   # sitio en :3000
```

Copia `.env.example` a `.env` para apuntar a la API (`VITE_API_URL`).

Desde la pantalla de acceso se puede **crear una cuenta**, que valida en vivo
las cuatro reglas de contraseña (`src/validation/password.ts`, réplica de las
del backend). El token se guarda en `localStorage` y se revalida contra
`/auth/me` en cada arranque; ver la nota sobre `localStorage` vs cookie
`httpOnly` en el README del backend.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo en http://localhost:3000
npm run build      # typecheck + build de producción en ./build
npm run preview    # servir localmente el build de producción
npm test           # tests
npm run test:watch # tests en modo watch
npm run lint       # ESLint
npm run typecheck  # solo comprobación de tipos
```

## Tests

Convención: **co-location**. Cada `*.test.tsx` vive junto al archivo que
prueba, con su mismo nombre. No hay carpeta `__tests__` ni `tests/`: solo
`src/test/`, que guarda el *setup* y los helpers compartidos.

```bash
npm test               # toda la batería
npm run test:watch
npm run test:coverage  # informe en coverage/
```

Qué cubre cada nivel:

| Archivo | Qué prueba |
| --- | --- |
| `App.test.tsx` | Solo el **enrutado**: qué ruta lleva a qué pantalla y quién puede entrar |
| `pages/*.test.tsx` | El **contenido** de cada pantalla, montada por separado |
| `components/*.test.tsx` | Cada componente aislado |
| `api/*.test.ts`, `hooks/`, `auth/`, `validation/` | Lógica sin interfaz |

Dos helpers en `src/test/utils.tsx` marcan la diferencia:

- **`renderRuta(ruta)`** monta la aplicación entera con sesión real. Solo para
  probar navegación y protección de rutas.
- **`renderConSesion(<Componente />, usuario)`** monta un único componente con
  la sesión ya resuelta. Es lo que usan los tests de página: sin navbar, sin
  pie y sin la llamada a `/auth/me`, que solo añadía lentitud y una condición
  de carrera.

`mockFetch([...])` sustituye `fetch` por un enrutador de dobles: cada entrada
declara método, patrón de URL y respuesta.

`css: false` en la configuración de Vitest: ningún test comprueba estilos
calculados, y transformar los 238 kB de Bootstrap en cada archivo multiplicaba
el tiempo de ejecución.

## Estructura

```
index.html                 punto de entrada (raíz, como pide Vite)
tsconfig.json              referencias a las dos configs de abajo
tsconfig.app.json          config de TS para src/ (strict)
tsconfig.node.json         config de TS para vite.config.ts
public/                    assets servidos tal cual
src/
  main.tsx                 monta React e importa Bootstrap + el tema
  App.tsx                  router y proveedor de sesión
  api/                     cliente HTTP tipado + llamadas (auth, gym)
  auth/                    AuthContext, AuthProvider y useAuth
  hooks/useRecurso.ts      carga de datos con estado y cancelación
  validation/password.ts   reglas de contraseña (réplica de las del backend)
  pages/Home.tsx           portada pública
  pages/LoginPage.tsx      acceso
  pages/RegisterPage.tsx   alta de socio
  pages/AccountPage.tsx    área de cliente
  pages/admin/             panel de administración (una pestaña por archivo)
  components/              secciones de la portada, Layout, Modal, Icon…
  data/gym.ts              CONTENIDO FICTICIO estático (sedes, clases, tarifas)
  types/gym.ts             interfaces de esos datos
  styles/theme.css         tema propio sobre Bootstrap
  assets/img/              fotografías
  test/utils.tsx           helpers de test (router, sesión, dobles de fetch)
```

Nota sobre los datos: `data/gym.ts` sigue teniendo el contenido **estático**
(sedes, clases, entrenadores, tarifas). Las promociones, los productos, la
membresía y las asistencias ya vienen **del backend**.

## Notas de implementación

**Bootstrap se usa solo como CSS.** No se importa su JavaScript: el desplegable
del navbar y el carrusel del hero están implementados con estado de React
(`Navbar.tsx`, `Hero.tsx`), que es más robusto que mezclar el DOM imperativo de
Bootstrap con el ciclo de vida de React. Si más adelante necesitas modales,
tooltips o dropdowns de Bootstrap, tendrás que importar
`bootstrap/dist/js/bootstrap.bundle.min.js` e inicializarlos dentro de un
`useEffect`.

**El tema se aplica por CSS custom properties.** `styles/theme.css` sobrescribe
variables de Bootstrap (`--bs-body-font-family`, `--bs-btn-*`…) en lugar de
recompilar el Sass, así que se puede actualizar Bootstrap sin tocar el tema. El
color de marca es `--rg-red: #e31c25`.

**Los tipos van por delante de los datos.** Cambiar `src/types/gym.ts` hace que
`tsc` señale exactamente qué hay que actualizar en `src/data/gym.ts` y en los
componentes.

## Pendiente

- Conectar con el backend (`../backend/`), hoy inexistente: los datos son
  estáticos y el formulario de contacto no envía nada. Ambos puntos están
  marcados con `TODO` en el código.
- Añadir `react-router` si se quieren páginas separadas; ahora es una sola
  página con anclas.
- Optimizar las imágenes (son JPEG sin comprimir de la plantilla original) y
  servirlas en WebP/AVIF.
