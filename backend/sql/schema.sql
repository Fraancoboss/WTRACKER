-- Creates the wtracker database schema
-- Run with: psql -U postgres -d wtracker -f backend/sql/schema.sql

CREATE TABLE IF NOT EXISTS pedidos (
  id TEXT PRIMARY KEY,
  fecha_entrada DATE NOT NULL,
  centro TEXT NOT NULL,
  material TEXT NOT NULL CHECK (material IN ('PVC', 'Aluminio')),
  fecha_vencimiento DATE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('Listo', 'En curso', 'Detenido', 'No iniciado')),
  incidencias TEXT,
  transporte BOOLEAN NOT NULL DEFAULT false,
  modulo_fabricacion JSONB,
  modulo_cristal JSONB,
  modulo_persianas JSONB,
  modulo_transporte JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS pedidos_set_updated_at ON pedidos;
CREATE TRIGGER pedidos_set_updated_at
BEFORE UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
