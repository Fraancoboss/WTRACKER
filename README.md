
# WTRACKER Web Structure Design

Interfaz en React para supervisar pedidos industriales y sus módulos (fabricación, cristal, persianas y transporte). El diseño original procede de Figma y este repositorio ofrece la implementación front-end lista para conectar con un backend propio.

## Tecnologías principales
- Node.js 25.1.0 y npm 10.x como entorno de ejecución.
- Vite 6.3.5 con `@vitejs/plugin-react-swc` para el bundling.
- React 18.3 con TypeScript, hooks y contextos locales.
- Radix UI, cmdk, Embla y otras librerías de componentes accesibles.
- Tailwind CSS (a través de utilidades en `index.css`) y `tailwind-merge`.

## Requisitos previos
1. Node.js ≥ 20 y npm instalados.
2. Git (opcional) para clonar el proyecto.
3. PostgreSQL si vas a conectar la futura API con una base de datos real.

## Puesta en marcha desde cero
1. `git clone <URL>`  
2. `cd TFG_WTRACKER`
3. `npm install` para restaurar `node_modules/`.
4. `cp .env.example .env` y ajusta `VITE_API_BASE_URL` si tu backend usa otra URL.
5. `npm run dev` para arrancar Vite (puedes ajustar el host/puerto en `vite.config.ts`).
6. Opcional: `npm run build` genera la versión optimizada en `build/` lista para servirse con tu infraestructura.

## Actualización para quienes venían de la versión inicial

| Antes (sólo frontend) | Después (frontend + backend) |
| --- | --- |
| Únicamente `npm install` y `npm run dev`. | Ahora necesitas levantar también el backend y la base de datos. |
| Los pedidos eran mocks en `src/App.tsx`. | Los datos se cargan vía API REST (`/api/pedidos`) conectada a PostgreSQL. |
| Sin variables de entorno. | Hay dos `.env`: uno en la raíz (`VITE_API_BASE_URL`) y otro en `backend/` (`PORT`, `DATABASE_URL`, etc.). |
| No había scripts SQL. | Usa `backend/sql/schema.sql` y `backend/sql/seed.sql` para crear y poblar la BD. |

Pasos rápidos para compañeros (Windows 11 incluido):
1. Asegúrate de tener Node 20+ y Git instalados.
2. Instala PostgreSQL 16 (desde [postgresql.org/download](https://www.postgresql.org/download/)) y toma nota del usuario/contraseña que definas.
3. Clona el repo y cambia al directorio `TFG_WTRACKER`.
4. `cp .env.example .env` (o copia manual en Windows) y deja `VITE_API_BASE_URL=http://localhost:4000/api`.
5. Abre `PowerShell` y ejecuta:
   ```powershell
   cd backend
   copy .env.example .env   # o edítalo a mano
   npm install
   npm run dev
   ```
6. Abre la consola de PostgreSQL (`psql`) y ejecuta:
   ```sql
   CREATE DATABASE wtracker;
   -- Conéctate con: \c wtracker
   -- importa el esquema (usa rutas absolutas o comillas para rutas con espacios)
   \i 'C:/Users/<tu_usuario>/ruta/al/proyecto/backend/sql/schema.sql'
   -- importa los datos de ejemplo
   \i 'C:/Users/<tu_usuario>/ruta/al/proyecto/backend/sql/seed.sql'
   ```
   Si tu usuario PostgreSQL no es `postgres`, actualiza `DATABASE_URL` en `backend/.env` para reflejar `postgresql://<usuario>:<contraseña>@localhost:5432/wtracker`.
7. En otra terminal, dentro de la raíz del proyecto:
   ```powershell
   npm install
   npm run dev -- --host 127.0.0.1 --port 3000
   ```
8. Accede a `http://localhost:3000`, inicia sesión y comprueba en la pestaña Network que se llaman los endpoints `http://localhost:4000/api/pedidos`. Si aparece CORS, revisa `FRONTEND_ORIGIN` en `backend/.env` (debe coincidir con la URL del front).

## Backend API (Node + Express)
El directorio `backend/` contiene una API Express creada para hablar con PostgreSQL.

1. `cd backend`
2. `cp .env.example .env` y ajusta las credenciales (`DATABASE_URL`, `PORT`, `FRONTEND_ORIGIN`).
3. `npm install`
4. `npm run dev` levanta la API en `http://localhost:4000` (por defecto) y expone:
   - `GET /health`: chequeo rápido.
   - `GET /api/pedidos`: lista todos los pedidos.
   - `GET /api/pedidos/:id`: devuelve un pedido.
   - `POST /api/pedidos`: inserta un pedido (valida con Zod antes de escribir).
   - `PUT /api/pedidos/:id`: actualiza un pedido existente.
5. `npm run build && npm start` para modo producción (genera `dist/` con TypeScript compilado).

## Scripts disponibles
- `npm run dev`: servidor de desarrollo con recarga en caliente.
- `npm run build`: empaqueta la aplicación en modo producción (target `esnext`).

En el backend:
- `npm run dev`: `tsx watch` para recompilar y reiniciar Express al vuelo.
- `npm run build`: compila a JavaScript en `dist/`.
- `npm start`: ejecuta el build.

## Arquitectura del frontend
- Entrada en `src/main.tsx` que monta `<App />`.
- Componentes clave:
  - `Login`: formulario simple que actúa como puerta de entrada.
  - `Sidebar`: navegación lateral con acciones e inicio de sesión/cierre.
  - `PanelGeneral`, `DetallePedido`, `PerfilUsuario`: paneles que muestran métricas generales, detalle editable de pedidos y ficha del usuario autenticado.
- Tipos y utilidades compartidas se encuentran en `src/types`, `src/components` y `src/styles`.

## Lógica de negocio actual
La lógica se gestiona en `src/App.tsx` mediante estado local:
- Autenticación simulada: hasta que el usuario envía credenciales, solo se muestra `<Login />`. Se guarda el usuario en estado y se habilita el resto del portal tras un `handleLogin`.
- Navegación: `Sidebar` controla `currentView` para mostrar Panel general, Detalle de pedidos o Perfil.
- Consumo de datos reales: al iniciar sesión, el cliente llama a `GET /api/pedidos` usando `VITE_API_BASE_URL`; errores muestran un mensaje y permiten reintentar.
- Modelo de datos: los handlers `handleAddPedido` y `handleUpdatePedido` mandan `POST`/`PUT` a la API y sincronizan el estado local con las respuestas.

## Integración con PostgreSQL y backend
1. Crea un servicio (Node/Express, Nest o similar) que exponga endpoints REST/GraphQL y conecte con PostgreSQL mediante `pg`, Prisma o Knex.
2. Define un `.env` backend con `DATABASE_URL=postgres://usuario:pass@host:5432/basedatos`.
3. Expón una URL pública para la API y consúmela desde el frontend creando un módulo (por ejemplo `src/lib/api.ts`) que use `fetch` sobre `import.meta.env.VITE_API_BASE_URL`.
4. Serializa la información de pedidos en la base de datos y sustituye los mocks del estado local por respuestas reales.

## Variables de entorno
- Frontend (usa `cp .env.example .env` en la raíz):  
  `VITE_API_BASE_URL=http://localhost:4000/api`
- Backend (`backend/.env`, basado en `backend/.env.example`):  
  ```
  PORT=4000
  DATABASE_URL=postgres://postgres:postgres@localhost:5432/wtracker
  DB_SSL=false
  FRONTEND_ORIGIN=http://localhost:5173
  ```

## Estado actual / pendientes
- Ajustar los flujos de cambio de estado (iniciado / en proceso / finalizado / detenido).
- Resolver fallos visuales/UX que queden del traspaso desde Figma.
- Definir y documentar la base de datos (usa `DATABASE.md` para el modelo y migraciones). 
