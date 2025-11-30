-- ============================================================
-- WTRACKER Seed Data v2.0
-- Sample data for testing with bcrypt hashed passwords
-- ============================================================

-- Password reference:
-- admin: admin123
-- maria.lopez (Oficina): oficina123
-- carlos.perez, marcos.lopez (Fabricación): fab123
-- pedro.diaz, maria.gonzalez (Cristal): cristal123
-- luis.ramos, juan.martinez (Persianas): persianas123
-- raul.perez (Transporte): trans123
-- ana.garcia (Visualización): visual123

-- ============================================================
-- Insert usuarios
-- ============================================================
INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
  -- Admin user (password: admin123)
  ('admin', 'admin@wtracker.com', '$2b$10$334NcmmEJclZnqYcanD.GOrr3IsxL4zVcruI7wfqf.yXotElQq2JO', 'Admin', true),
  
  -- Oficina users (password: oficina123)
  ('maria.lopez', 'maria.lopez@wtracker.com', '$2b$10$Gb0HzULbVCrMQKo7FMKqlOIqmL8Sm/3OLT3bfxfpfTL9LXHW96iKu', 'Oficina', true),
  
  -- Fabricación operators (password: fab123)
  ('carlos.perez', 'carlos.perez@wtracker.com', '$2b$10$8huQkVq0utiN6zL2gaeLnucA/eNk9N4IB3P1eCpPdoLWReRZrriKi', 'Fabricación', true),
  ('marcos.lopez', 'marcos.lopez@wtracker.com', '$2b$10$8huQkVq0utiN6zL2gaeLnucA/eNk9N4IB3P1eCpPdoLWReRZrriKi', 'Fabricación', true),
  
  -- Cristal operators (password: cristal123)
  ('pedro.diaz', 'pedro.diaz@wtracker.com', '$2b$10$rpm67jtwK92TAX7jMFg.0OOLl0UKd3gjuwy/nN76PgEw/ibPVJfL6', 'Cristal', true),
  ('maria.gonzalez', 'maria.gonzalez@wtracker.com', '$2b$10$rpm67jtwK92TAX7jMFg.0OOLl0UKd3gjuwy/nN76PgEw/ibPVJfL6', 'Cristal', true),
  
  -- Persianas operators (password: persianas123)
  ('luis.ramos', 'luis.ramos@wtracker.com', '$2b$10$OFAWgHRaR7uDtub5x7KCTO49DT8UDl8ZysVSvt5atzCHG5T7Rgww2', 'Persianas', true),
  ('juan.martinez', 'juan.martinez@wtracker.com', '$2b$10$OFAWgHRaR7uDtub5x7KCTO49DT8UDl8ZysVSvt5atzCHG5T7Rgww2', 'Persianas', true),
  
  -- Transporte operators (password: trans123)
  ('raul.perez', 'raul.perez@wtracker.com', '$2b$10$0O/j7zYCz.JiKPcx4A8pBOwrlhTPkv1fC42o1zU3v8ATXEi25NVBu', 'Transporte', true),
  
  -- Visualización users (password: visual123)
  ('ana.garcia', 'ana.garcia@wtracker.com', '$2b$10$Pf3nF.s3febr2IhuKAMeDuMop6aJqRsx4H8Nj8AzBbX5XUQhMlXoa', 'Visualización', true)
ON CONFLICT (nombre) DO NOTHING;


-- ============================================================
-- Insert pedidos
-- ============================================================
INSERT INTO pedidos (id, fecha_entrada, centro, material, fecha_vencimiento, estado, incidencias, transporte, created_by) VALUES
  ('PED-2025-001', '2025-01-15', 'Alcobendas', 'PVC', '2025-02-15', 'En curso', NULL, true, 1),
  ('PED-2025-002', '2025-01-16', 'Usera', 'Aluminio', '2025-02-20', 'No iniciado', 'Pendiente de confirmación del cliente', false, 1),
  ('PED-2025-003', '2025-01-10', 'Rivas', 'PVC', '2025-01-25', 'Listo', NULL, true, 2),
  ('PED-2025-004', '2025-01-17', 'Alcorcón', 'Aluminio', '2025-02-28', 'Detenido', 'Falta de material', false, 2),
  ('PED-2025-005', '2025-01-18', 'Alcobendas', 'PVC', '2025-02-10', 'En curso', NULL, true, 1),
  ('PED-2025-006', '2025-01-19', 'Usera', 'PVC', '2025-02-25', 'No iniciado', NULL, false, 1)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Insert fases
-- ============================================================
INSERT INTO fases (pedido_id, tipo, estado, fecha_inicio, fecha_fin, operario_id, observaciones) VALUES
  -- PED-2025-001 (En curso)
  ('PED-2025-001', 'Fabricación', 'En proceso', '2025-01-15', NULL, 3, 'Proceso normal'),
  ('PED-2025-001', 'Cristal', 'Pendiente', NULL, NULL, 5, NULL),
  ('PED-2025-001', 'Persianas', 'Pendiente', NULL, NULL, 7, NULL),
  ('PED-2025-001', 'Transporte', 'Pendiente', NULL, NULL, 9, 'Requiere camión grande'),
  
  -- PED-2025-002 (No iniciado)
  ('PED-2025-002', 'Fabricación', 'Pendiente', NULL, NULL, 4, NULL),
  ('PED-2025-002', 'Cristal', 'Pendiente', NULL, NULL, 6, NULL),
  ('PED-2025-002', 'Persianas', 'Pendiente', NULL, NULL, 8, NULL),
  
  -- PED-2025-003 (Listo)
  ('PED-2025-003', 'Fabricación', 'Completado', '2025-01-10', '2025-01-18', 3, 'Completado sin incidencias'),
  ('PED-2025-003', 'Cristal', 'Completado', '2025-01-18', '2025-01-22', 5, 'Cristal de alta calidad'),
  ('PED-2025-003', 'Persianas', 'Completado', '2025-01-22', '2025-01-24', 7, 'Instalación correcta'),
  ('PED-2025-003', 'Transporte', 'Pendiente', NULL, NULL, 9, 'Listo para envío'),
  
  -- PED-2025-004 (Detenido)
  ('PED-2025-004', 'Fabricación', 'Bloqueado', '2025-01-17', NULL, 4, 'Aluminio en stock insuficiente'),
  ('PED-2025-004', 'Cristal', 'Pendiente', NULL, NULL, 6, NULL),
  ('PED-2025-004', 'Persianas', 'Pendiente', NULL, NULL, 8, NULL),
  
  -- PED-2025-005 (En curso)
  ('PED-2025-005', 'Fabricación', 'Completado', '2025-01-18', '2025-01-20', 3, NULL),
  ('PED-2025-005', 'Cristal', 'En proceso', '2025-01-20', NULL, 5, 'En proceso de corte'),
  ('PED-2025-005', 'Persianas', 'Pendiente', NULL, NULL, 7, NULL),
  ('PED-2025-005', 'Transporte', 'Pendiente', NULL, NULL, 9, NULL),
  
  -- PED-2025-006 (No iniciado)
  ('PED-2025-006', 'Fabricación', 'Pendiente', NULL, NULL, 4, NULL),
  ('PED-2025-006', 'Cristal', 'Pendiente', NULL, NULL, 6, NULL),
  ('PED-2025-006', 'Persianas', 'Pendiente', NULL, NULL, 8, NULL)
ON CONFLICT (pedido_id, tipo) DO NOTHING;

-- ============================================================
-- Insert sample audit log entries
-- ============================================================
INSERT INTO audit_log (usuario_id, accion, entidad, entidad_id, datos_nuevos, timestamp) VALUES
  (1, 'CREATE', 'pedido', 'PED-2025-001', '{"centro": "Alcobendas", "material": "PVC"}', '2025-01-15 09:00:00'),
  (1, 'CREATE', 'pedido', 'PED-2025-002', '{"centro": "Usera", "material": "Aluminio"}', '2025-01-16 10:30:00'),
  (2, 'CREATE', 'pedido', 'PED-2025-003', '{"centro": "Rivas", "material": "PVC"}', '2025-01-10 08:15:00'),
  (3, 'UPDATE', 'fase', '1', '{"estado": "En proceso"}', '2025-01-15 10:00:00'),
  (5, 'UPDATE', 'fase', '9', '{"estado": "Completado"}', '2025-01-22 16:30:00');

-- ============================================================
-- Verification queries
-- ============================================================

-- Count records
-- SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios
-- UNION ALL
-- SELECT 'pedidos', COUNT(*) FROM pedidos
-- UNION ALL
-- SELECT 'fases', COUNT(*) FROM fases
-- UNION ALL
-- SELECT 'audit_log', COUNT(*) FROM audit_log;

-- Verify pedido estados are auto-calculated correctly
-- SELECT p.id, p.estado, 
--   COUNT(f.id) as total_fases,
--   COUNT(f.id) FILTER (WHERE f.estado = 'Completado') as completadas,
--   COUNT(f.id) FILTER (WHERE f.estado = 'En proceso') as en_proceso,
--   COUNT(f.id) FILTER (WHERE f.estado = 'Bloqueado') as bloqueadas
-- FROM pedidos p
-- LEFT JOIN fases f ON p.id = f.pedido_id
-- GROUP BY p.id, p.estado
-- ORDER BY p.id;
