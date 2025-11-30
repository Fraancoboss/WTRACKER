-- ============================================================
-- WTRACKER Database Schema v2.0
-- Normalized schema with authentication and audit support
-- ============================================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS fases CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ============================================================
-- Table: usuarios
-- Stores user accounts with bcrypt hashed passwords
-- ============================================================
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('Admin', 'Oficina', 'Fabricación', 'Cristal', 'Persianas', 'Transporte', 'Visualización')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster login queries
CREATE INDEX idx_usuarios_nombre ON usuarios(nombre);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- ============================================================
-- Table: pedidos
-- Stores order information
-- ============================================================
CREATE TABLE pedidos (
  id TEXT PRIMARY KEY,
  fecha_entrada DATE NOT NULL,
  centro VARCHAR(100) NOT NULL,
  material VARCHAR(20) NOT NULL CHECK (material IN ('PVC', 'Aluminio')),
  fecha_vencimiento DATE NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('Listo', 'En curso', 'Detenido', 'No iniciado')) DEFAULT 'No iniciado',
  incidencias TEXT,
  transporte BOOLEAN NOT NULL DEFAULT false,
  created_by INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pedidos_fecha_entrada ON pedidos(fecha_entrada);
CREATE INDEX idx_pedidos_centro ON pedidos(centro);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_pedidos_fecha_vencimiento ON pedidos(fecha_vencimiento);
CREATE INDEX idx_pedidos_created_by ON pedidos(created_by);

-- ============================================================
-- Table: fases
-- Stores phases for each order (Fabricación, Cristal, Persianas, Transporte)
-- ============================================================
CREATE TABLE fases (
  id SERIAL PRIMARY KEY,
  pedido_id TEXT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Fabricación', 'Cristal', 'Persianas', 'Transporte')),
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('Completado', 'En proceso', 'Pendiente', 'Bloqueado')) DEFAULT 'Pendiente',
  fecha_inicio DATE,
  fecha_fin DATE,
  operario_id INTEGER REFERENCES usuarios(id),
  observaciones TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(pedido_id, tipo)  -- Each pedido can only have one fase of each type
);

-- Indexes for performance
CREATE INDEX idx_fases_pedido_id ON fases(pedido_id);
CREATE INDEX idx_fases_tipo ON fases(tipo);
CREATE INDEX idx_fases_estado ON fases(estado);
CREATE INDEX idx_fases_operario_id ON fases(operario_id);

-- ============================================================
-- Table: audit_log
-- Stores audit trail for all changes
-- ============================================================
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  accion VARCHAR(50) NOT NULL,  -- 'CREATE', 'UPDATE', 'DELETE'
  entidad VARCHAR(50) NOT NULL,  -- 'pedido', 'fase', 'usuario'
  entidad_id TEXT NOT NULL,
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for audit queries
CREATE INDEX idx_audit_log_usuario_id ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_entidad ON audit_log(entidad, entidad_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);

-- ============================================================
-- Triggers
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER fases_updated_at
  BEFORE UPDATE ON fases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Function to update pedido estado based on fases
-- ============================================================
CREATE OR REPLACE FUNCTION update_pedido_estado()
RETURNS TRIGGER AS $$
DECLARE
  v_pedido_id TEXT;
  v_completadas INTEGER;
  v_en_proceso INTEGER;
  v_bloqueadas INTEGER;
  v_total INTEGER;
BEGIN
  -- Get the pedido_id (works for INSERT, UPDATE, DELETE)
  v_pedido_id := COALESCE(NEW.pedido_id, OLD.pedido_id);
  
  -- Count fases by estado
  SELECT 
    COUNT(*) FILTER (WHERE estado = 'Completado'),
    COUNT(*) FILTER (WHERE estado = 'En proceso'),
    COUNT(*) FILTER (WHERE estado = 'Bloqueado'),
    COUNT(*)
  INTO v_completadas, v_en_proceso, v_bloqueadas, v_total
  FROM fases
  WHERE pedido_id = v_pedido_id;
  
  -- Update pedido estado based on fases
  UPDATE pedidos
  SET estado = CASE
    WHEN v_completadas = v_total THEN 'Listo'
    WHEN v_bloqueadas > 0 THEN 'Detenido'
    WHEN v_en_proceso > 0 THEN 'En curso'
    ELSE 'No iniciado'
  END
  WHERE id = v_pedido_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update pedido estado when fases change
CREATE TRIGGER fases_update_pedido_estado
  AFTER INSERT OR UPDATE OR DELETE ON fases
  FOR EACH ROW
  EXECUTE FUNCTION update_pedido_estado();

-- ============================================================
-- Comments for documentation
-- ============================================================
COMMENT ON TABLE usuarios IS 'User accounts with authentication';
COMMENT ON TABLE pedidos IS 'Manufacturing orders';
COMMENT ON TABLE fases IS 'Order phases (Fabricación, Cristal, Persianas, Transporte)';
COMMENT ON TABLE audit_log IS 'Audit trail for all changes';

COMMENT ON COLUMN usuarios.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN usuarios.rol IS 'User role for authorization';
COMMENT ON COLUMN pedidos.estado IS 'Auto-calculated from fases estados';
COMMENT ON COLUMN fases.operario_id IS 'Assigned operator for this fase';
