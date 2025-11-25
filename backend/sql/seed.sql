-- Sample data to test the API quickly
-- Run with: psql -U postgres -d wtracker -f backend/sql/seed.sql

INSERT INTO pedidos (
  id, fecha_entrada, centro, material, fecha_vencimiento,
  estado, incidencias, transporte,
  modulo_fabricacion, modulo_cristal, modulo_persianas, modulo_transporte
) VALUES
  (
    'PED-2025-001', '2025-01-15', 'Alcobendas', 'PVC', '2025-02-15',
    'En curso', NULL, true,
    '{"estado":"En proceso","fechaInicio":"2025-01-16","observaciones":"Proceso normal","operario":"Carlos Pérez"}',
    '{"estado":"Pendiente","observaciones":"","operario":""}',
    '{"estado":"Pendiente","observaciones":"","operario":""}',
    '{"estado":true,"observaciones":"Requiere camión grande"}'
  )
ON CONFLICT (id) DO NOTHING;
