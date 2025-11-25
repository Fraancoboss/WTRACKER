-- ============================================================
-- 📦 BASE DE DATOS: WTRACKER
-- 🧰 Propósito: Gestión y seguimiento de fabricación de ventanas
-- 💾 Motor: PostgreSQL
-- 󰞵 Autor: Fran
-- ============================================================
-- ============================================================
-- 1⃣ CREAR BASE DE DATOS (opcional si aún no existe)
-- ============================================================
CREATE DATABASE wtracker;
-- Para usarla (solo si estás en consola psql):
-- \c wtracker;
-- ============================================================
-- 2⃣ TABLA: usuario
-- Descripción: Guarda las credenciales de acceso a la aplicación.
-- ============================================================
CREATE TABLE usuario (
id_usuario SERIAL PRIMARY KEY, -- Identificador único automático
nombre VARCHAR(50) NOT NULL, -- Nombre del usuario
contraseña VARCHAR(50) NOT NULL -- Contraseña en texto claro (⚠ sólo para pruebas)
);
-- Ejemplo de inserción de usuario:
-- INSERT INTO usuario (nombre, contraseña) VALUES ('admin', '1234');
-- ============================================================
-- 3⃣ TABLA: pedido
-- Descripción: Representa un pedido de fabricación de ventana.
-- Cada pedido tiene fechas, centro, material, estado, etc.
-- ============================================================
CREATE TABLE pedido (
id_pedido SERIAL PRIMARY KEY, -- ID único del pedido (auto incremental)
registro_entrada DATE NOT NULL, -- Fecha en que entra el pedido al sistema
centro VARCHAR(50) NOT NULL, -- Ej. Alcobendas, Usera, Rivas...
material VARCHAR(20) CHECK (material IN ('PVC', 'Aluminio')) NOT NULL, -- Tipo de material
fecha_vencimiento DATE, -- Fecha límite de entrega
estado VARCHAR(20) CHECK (estado IN ('No iniciado','En curso','Detenido','Listo','Finalizado')) DEFAULT 'No iniciado',
incidencia VARCHAR(255), -- Breve descripción de incidencias o problemas
transporte BOOLEAN DEFAULT FALSE, -- Indica si requiere transporte (true/false)
observaciones TEXT -- Comentarios adicionales del pedido
);
-- Ejemplo:
-- INSERT INTO pedido (registro_entrada, centro, material, fecha_vencimiento, estado)
-- VALUES ('2025-01-15', 'Alcobendas', 'PVC', '2025-02-15', 'En curso');
-- ============================================================
-- 4⃣ TABLA: fase
-- Descripción: Cada pedido pasa por varias fases (Fabricación, Cristal, Persianas, Transporte).
-- Cada fase tiene su propio estado, fechas, y operario.
-- ============================================================
CREATE TABLE fase (
id_fase SERIAL PRIMARY KEY, -- ID único de fase
pedido_id INTEGER NOT NULL, -- Referencia al pedido al que pertenece
tipo_fase VARCHAR(20) CHECK (tipo_fase IN ('Fabricación','Cristal','Persianas','Transporte')) NOT NULL,
estado VARCHAR(20) CHECK (estado IN ('Pendiente','No iniciado','En curso','Listo','Finalizado')) DEFAULT 'Pendiente',
fecha_inicio DATE, -- Fecha de inicio de la fase
fecha_fin DATE, -- Fecha de finalización de la fase
operario VARCHAR(100), -- Nombre del operario asignado (uno por fase)
observaciones TEXT, -- Comentarios u observaciones de la fase
CONSTRAINT fk_pedido FOREIGN KEY (pedido_id)
REFERENCES pedido(id_pedido)
ON DELETE CASCADE -- Si se borra un pedido, se eliminan sus fases
);
-- Ejemplo:
-- INSERT INTO fase (pedido_id, tipo_fase, estado, operario)
-- VALUES (1, 'Fabricación', 'En curso', 'Juan Pérez');
-- ============================================================
-- 5⃣ DATOS DE PRUEBA (opcionales)
-- ============================================================
-- Usuarios
INSERT INTO usuario (nombre, contraseña)
VALUES ('admin', '1234'),
('operario1', 'abcd');
-- Pedidos
INSERT INTO pedido (registro_entrada, centro, material, fecha_vencimiento, estado, incidencia, transporte, observaciones)
VALUES
('2025-01-15', 'Alcobendas', 'PVC', '2025-02-15', 'En curso', NULL, TRUE, 'Sin observaciones'),
('2025-01-16', 'Usera', 'Aluminio', '2025-02-20', 'No iniciado', 'Pendiente de confirmación del cliente', FALSE, NULL),
('2025-01-10', 'Rivas', 'PVC', '2025-01-25', 'Listo', NULL, TRUE, NULL),
('2025-01-17', 'Alcorcón', 'Aluminio', '2025-02-28', 'Detenido', 'Falta de material', FALSE, NULL);
-- Fases
INSERT INTO fase (pedido_id, tipo_fase, estado, fecha_inicio, fecha_fin, operario, observaciones)
VALUES
(1, 'Fabricación', 'En curso', '2025-01-15', NULL, 'Marcos López', NULL),
(1, 'Cristal', 'Pendiente', NULL, NULL, 'Pedro Díaz', NULL),
(1, 'Persianas', 'Pendiente', NULL, NULL, 'Luis Ramos', NULL),
(1, 'Transporte', 'Pendiente', NULL, NULL, 'Raúl Pérez', NULL),
(2, 'Fabricación', 'No iniciado', NULL, NULL, 'Carlos Ruiz', NULL),
(3, 'Fabricación', 'Finalizado', '2025-01-10', '2025-01-24', 'Laura Sánchez', NULL),
(4, 'Fabricación', 'Detenido', '2025-01-17', NULL, 'Miguel Torres', 'Aluminio en stock insuficiente');
-- ============================================================
-- ✅ CONSULTAS DE COMPROBACIÓN RÁPIDA
-- ============================================================
-- Ver todos los pedidos
-- SELECT * FROM pedido;
-- Ver todas las fases con el nombre del centro
-- SELECT f.id_fase, p.centro, f.tipo_fase, f.estado, f.operario
-- FROM fase f
-- JOIN pedido p ON f.pedido_id = p.id_pedido;
-- ============================================================
-- 🏁 FIN DEL SCRIPT
-- ============================================================

user: postgre
password: 1234
PostgreSQL
## WTRACKER – Guía de base de datos

Esta aplicación espera una base de datos PostgreSQL con una tabla `pedidos` que almacena el mismo modelo que maneja el frontend (`src/types`). Sigue los pasos para crearla en tu equipo desde cero.

### 1. Instalar y arrancar PostgreSQL
1. Linux (Debian/Ubuntu): `sudo apt install postgresql postgresql-contrib`
2. Mac (Homebrew): `brew install postgresql@16`
3. Windows: descarga el instalador oficial desde https://www.postgresql.org/download/.
4. Asegúrate de que el servicio está levantado (`sudo service postgresql start` o equivalente).

### 2. Crear usuario y base de datos
```bash
sudo -u postgres psql
```
Dentro de la consola `psql` ejecuta:
```sql
CREATE ROLE wtracker WITH LOGIN PASSWORD 'wtracker';
CREATE DATABASE wtracker OWNER wtracker;
\q
```
Actualiza tu `backend/.env` con `DATABASE_URL=postgres://wtracker:wtracker@localhost:5432/wtracker` (o la cadena que prefieras).

### 3. Crear la tabla y los triggers
El repositorio incluye SQL listo en `backend/sql/schema.sql`.
```bash
psql -U wtracker -d wtracker -f backend/sql/schema.sql
```
Este script crea la tabla `pedidos` con columnas JSONB para los módulos y un trigger que actualiza `updated_at`.

### 4. Insertar datos de ejemplo
Para que el frontend encuentre algo cuando llame a `/api/pedidos`, puedes sembrar un pedido inicial:
```bash
psql -U wtracker -d wtracker -f backend/sql/seed.sql
```
Modifica `backend/sql/seed.sql` o crea tus propios `INSERT` según necesites.

### 5. Probar la conexión desde el backend
1. `cd backend`
2. `cp .env.example .env` (si aún no lo hiciste) y revisa `DATABASE_URL`, `PORT`, `FRONTEND_ORIGIN` y `DB_SSL`.
3. `npm install`
4. `npm run dev`
Si todo está correcto verás `API lista en http://localhost:4000` y los endpoints `/api/pedidos` devolverán los datos recién insertados.

### 6. Siguiente pasos
- Añade más tablas si necesitas usuarios, centros, auditorías, etc.
- Considera usar migraciones (Prisma, Knex, Drizzle) si el esquema va a crecer.
- Configura backups con `pg_dump` y monitoriza el pool de conexiones si despliegas en producción.
