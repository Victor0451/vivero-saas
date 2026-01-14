-- ============================================
-- Vivero SaaS - Notifications System Schema
-- ============================================

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id_notificacion BIGSERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  id_usuario UUID NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'tarea_vencida', 'tarea_proxima', 'planta_enferma', 'nueva_planta'
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  url_accion TEXT, -- Link para navegar al detalle (ej: /dashboard/tareas/123)
  metadata JSONB, -- Datos adicionales flexibles
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(id_usuario, leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_tenant ON notificaciones(id_tenant);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created ON notificaciones(created_at DESC);

-- Tabla de preferencias de notificaciones
CREATE TABLE IF NOT EXISTS preferencias_notificaciones (
  id_preferencia BIGSERIAL PRIMARY KEY,
  id_usuario UUID NOT NULL,
  tipo_notificacion VARCHAR(50) NOT NULL,
  habilitada BOOLEAN DEFAULT TRUE,
  frecuencia VARCHAR(20) DEFAULT 'inmediata', -- 'inmediata', 'diaria', 'semanal', 'deshabilitada'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_usuario, tipo_notificacion)
);

-- Índice para preferencias
CREATE INDEX IF NOT EXISTS idx_preferencias_usuario ON preferencias_notificaciones(id_usuario);

-- RLS (Row Level Security) Policies
-- Habilitar RLS en las tablas
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE preferencias_notificaciones ENABLE ROW LEVEL SECURITY;

-- Política para notificaciones: usuarios solo ven sus propias notificaciones
CREATE POLICY notificaciones_select_policy ON notificaciones
  FOR SELECT
  USING (id_usuario = auth.uid());

CREATE POLICY notificaciones_insert_policy ON notificaciones
  FOR INSERT
  WITH CHECK (id_usuario = auth.uid());

CREATE POLICY notificaciones_update_policy ON notificaciones
  FOR UPDATE
  USING (id_usuario = auth.uid());

CREATE POLICY notificaciones_delete_policy ON notificaciones
  FOR DELETE
  USING (id_usuario = auth.uid());

-- Política para preferencias: usuarios solo ven sus propias preferencias
CREATE POLICY preferencias_select_policy ON preferencias_notificaciones
  FOR SELECT
  USING (id_usuario = auth.uid());

CREATE POLICY preferencias_insert_policy ON preferencias_notificaciones
  FOR INSERT
  WITH CHECK (id_usuario = auth.uid());

CREATE POLICY preferencias_update_policy ON preferencias_notificaciones
  FOR UPDATE
  USING (id_usuario = auth.uid());

CREATE POLICY preferencias_delete_policy ON preferencias_notificaciones
  FOR DELETE
  USING (id_usuario = auth.uid());

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en preferencias
CREATE TRIGGER update_preferencias_updated_at
  BEFORE UPDATE ON preferencias_notificaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar preferencias por defecto para tipos de notificaciones
-- Nota: Esto se puede hacer via server action cuando un usuario se registra
-- INSERT INTO preferencias_notificaciones (id_usuario, tipo_notificacion, habilitada, frecuencia)
-- VALUES
--   (auth.uid(), 'tarea_vencida', TRUE, 'inmediata'),
--   (auth.uid(), 'tarea_proxima', TRUE, 'inmediata'),
--   (auth.uid(), 'planta_enferma', TRUE, 'diaria'),
--   (auth.uid(), 'nueva_planta', TRUE, 'inmediata')
-- ON CONFLICT (id_usuario, tipo_notificacion) DO NOTHING;
