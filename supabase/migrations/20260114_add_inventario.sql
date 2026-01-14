-- ============================================
-- Vivero SaaS - Gestión de Inventario
-- Migración: Sistema completo de inventario
-- Fecha: 2026-01-14
-- ============================================

-- ============================================
-- 1. TABLA: categorias_inventario
-- ============================================

CREATE TABLE IF NOT EXISTS categorias_inventario (
  id_categoria SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_categoria_tenant UNIQUE(id_tenant, nombre)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_categorias_tenant ON categorias_inventario(id_tenant);

-- RLS
ALTER TABLE categorias_inventario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS categorias_select_policy ON categorias_inventario;
CREATE POLICY categorias_select_policy ON categorias_inventario
  FOR SELECT
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS categorias_insert_policy ON categorias_inventario;
CREATE POLICY categorias_insert_policy ON categorias_inventario
  FOR INSERT
  WITH CHECK (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS categorias_update_policy ON categorias_inventario;
CREATE POLICY categorias_update_policy ON categorias_inventario
  FOR UPDATE
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS categorias_delete_policy ON categorias_inventario;
CREATE POLICY categorias_delete_policy ON categorias_inventario
  FOR DELETE
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

-- ============================================
-- 2. TABLA: items_inventario
-- ============================================

CREATE TABLE IF NOT EXISTS items_inventario (
  id_item SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  id_categoria INTEGER REFERENCES categorias_inventario(id_categoria) ON DELETE SET NULL,
  codigo VARCHAR(50),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  unidad_medida VARCHAR(50) NOT NULL,
  stock_actual DECIMAL(10,2) DEFAULT 0 CHECK (stock_actual >= 0),
  stock_minimo DECIMAL(10,2) DEFAULT 0 CHECK (stock_minimo >= 0),
  stock_maximo DECIMAL(10,2) CHECK (stock_maximo IS NULL OR stock_maximo >= stock_minimo),
  precio_unitario DECIMAL(10,2) CHECK (precio_unitario IS NULL OR precio_unitario >= 0),
  ubicacion VARCHAR(100),
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_codigo_tenant UNIQUE(id_tenant, codigo)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_items_tenant ON items_inventario(id_tenant);
CREATE INDEX IF NOT EXISTS idx_items_categoria ON items_inventario(id_categoria);
CREATE INDEX IF NOT EXISTS idx_items_codigo ON items_inventario(codigo) WHERE codigo IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_items_activo ON items_inventario(activo);
CREATE INDEX IF NOT EXISTS idx_items_stock_bajo ON items_inventario(stock_actual, stock_minimo) 
  WHERE stock_actual <= stock_minimo AND activo = true;

-- RLS
ALTER TABLE items_inventario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS items_select_policy ON items_inventario;
CREATE POLICY items_select_policy ON items_inventario
  FOR SELECT
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS items_insert_policy ON items_inventario;
CREATE POLICY items_insert_policy ON items_inventario
  FOR INSERT
  WITH CHECK (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS items_update_policy ON items_inventario;
CREATE POLICY items_update_policy ON items_inventario
  FOR UPDATE
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS items_delete_policy ON items_inventario;
CREATE POLICY items_delete_policy ON items_inventario
  FOR DELETE
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

-- ============================================
-- 3. TABLA: proveedores
-- ============================================

CREATE TABLE IF NOT EXISTS proveedores (
  id_proveedor SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  codigo VARCHAR(50),
  nombre VARCHAR(200) NOT NULL,
  razon_social VARCHAR(200),
  rut_cuit VARCHAR(50),
  contacto VARCHAR(100),
  telefono VARCHAR(50),
  email VARCHAR(100),
  direccion TEXT,
  ciudad VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'Argentina',
  sitio_web VARCHAR(200),
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT unique_proveedor_codigo_tenant UNIQUE(id_tenant, codigo)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_proveedores_tenant ON proveedores(id_tenant);
CREATE INDEX IF NOT EXISTS idx_proveedores_activo ON proveedores(activo);
CREATE INDEX IF NOT EXISTS idx_proveedores_nombre ON proveedores(nombre);

-- RLS
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS proveedores_select_policy ON proveedores;
CREATE POLICY proveedores_select_policy ON proveedores
  FOR SELECT
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS proveedores_insert_policy ON proveedores;
CREATE POLICY proveedores_insert_policy ON proveedores
  FOR INSERT
  WITH CHECK (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS proveedores_update_policy ON proveedores;
CREATE POLICY proveedores_update_policy ON proveedores
  FOR UPDATE
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS proveedores_delete_policy ON proveedores;
CREATE POLICY proveedores_delete_policy ON proveedores
  FOR DELETE
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

-- ============================================
-- 4. TABLA: items_proveedores (relación N:N)
-- ============================================

CREATE TABLE IF NOT EXISTS items_proveedores (
  id_item INTEGER REFERENCES items_inventario(id_item) ON DELETE CASCADE,
  id_proveedor INTEGER REFERENCES proveedores(id_proveedor) ON DELETE CASCADE,
  precio_compra DECIMAL(10,2) CHECK (precio_compra IS NULL OR precio_compra >= 0),
  tiempo_entrega_dias INTEGER CHECK (tiempo_entrega_dias IS NULL OR tiempo_entrega_dias >= 0),
  es_proveedor_principal BOOLEAN DEFAULT false,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id_item, id_proveedor)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_items_proveedores_item ON items_proveedores(id_item);
CREATE INDEX IF NOT EXISTS idx_items_proveedores_proveedor ON items_proveedores(id_proveedor);

-- RLS
ALTER TABLE items_proveedores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS items_proveedores_select_policy ON items_proveedores;
CREATE POLICY items_proveedores_select_policy ON items_proveedores
  FOR SELECT
  USING (
    id_item IN (
      SELECT id_item FROM items_inventario 
      WHERE id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid())
    )
  );

DROP POLICY IF EXISTS items_proveedores_insert_policy ON items_proveedores;
CREATE POLICY items_proveedores_insert_policy ON items_proveedores
  FOR INSERT
  WITH CHECK (
    id_item IN (
      SELECT id_item FROM items_inventario 
      WHERE id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid())
    )
  );

DROP POLICY IF EXISTS items_proveedores_update_policy ON items_proveedores;
CREATE POLICY items_proveedores_update_policy ON items_proveedores
  FOR UPDATE
  USING (
    id_item IN (
      SELECT id_item FROM items_inventario 
      WHERE id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid())
    )
  );

DROP POLICY IF EXISTS items_proveedores_delete_policy ON items_proveedores;
CREATE POLICY items_proveedores_delete_policy ON items_proveedores
  FOR DELETE
  USING (
    id_item IN (
      SELECT id_item FROM items_inventario 
      WHERE id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid())
    )
  );

-- ============================================
-- 5. TABLA: movimientos_inventario
-- ============================================

CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id_movimiento SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  id_item INTEGER NOT NULL REFERENCES items_inventario(id_item) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad DECIMAL(10,2) NOT NULL CHECK (cantidad > 0),
  stock_anterior DECIMAL(10,2) NOT NULL CHECK (stock_anterior >= 0),
  stock_nuevo DECIMAL(10,2) NOT NULL CHECK (stock_nuevo >= 0),
  precio_unitario DECIMAL(10,2) CHECK (precio_unitario IS NULL OR precio_unitario >= 0),
  costo_total DECIMAL(10,2) CHECK (costo_total IS NULL OR costo_total >= 0),
  motivo TEXT,
  referencia VARCHAR(100),
  id_proveedor INTEGER REFERENCES proveedores(id_proveedor) ON DELETE SET NULL,
  id_tarea INTEGER REFERENCES tareas(id_tarea) ON DELETE SET NULL,
  id_usuario UUID REFERENCES users(id_user) ON DELETE SET NULL,
  fecha TIMESTAMP DEFAULT NOW(),
  notas TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_movimientos_tenant ON movimientos_inventario(id_tenant);
CREATE INDEX IF NOT EXISTS idx_movimientos_item ON movimientos_inventario(id_item);
CREATE INDEX IF NOT EXISTS idx_movimientos_tipo ON movimientos_inventario(tipo);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_inventario(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_movimientos_tarea ON movimientos_inventario(id_tarea) WHERE id_tarea IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_movimientos_proveedor ON movimientos_inventario(id_proveedor) WHERE id_proveedor IS NOT NULL;

-- RLS
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS movimientos_select_policy ON movimientos_inventario;
CREATE POLICY movimientos_select_policy ON movimientos_inventario
  FOR SELECT
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS movimientos_insert_policy ON movimientos_inventario;
CREATE POLICY movimientos_insert_policy ON movimientos_inventario
  FOR INSERT
  WITH CHECK (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS movimientos_update_policy ON movimientos_inventario;
CREATE POLICY movimientos_update_policy ON movimientos_inventario
  FOR UPDATE
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

DROP POLICY IF EXISTS movimientos_delete_policy ON movimientos_inventario;
CREATE POLICY movimientos_delete_policy ON movimientos_inventario
  FOR DELETE
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));

-- ============================================
-- 6. FUNCIÓN Y TRIGGER: Actualizar stock automáticamente
-- ============================================

-- Eliminar función y trigger si existen
DROP TRIGGER IF EXISTS trigger_actualizar_stock ON movimientos_inventario;
DROP FUNCTION IF EXISTS actualizar_stock_item();

-- Crear función para actualizar stock
CREATE OR REPLACE FUNCTION actualizar_stock_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar stock_actual del item
  UPDATE items_inventario
  SET 
    stock_actual = NEW.stock_nuevo,
    updated_at = NOW()
  WHERE id_item = NEW.id_item;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger después de insertar movimiento
CREATE TRIGGER trigger_actualizar_stock
  AFTER INSERT ON movimientos_inventario
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_stock_item();

-- ============================================
-- 7. SEED: Categorías predefinidas
-- ============================================

-- Nota: Este seed se ejecutará solo si no existen categorías
-- Se debe ejecutar manualmente por tenant según sea necesario

-- Ejemplo de insert (comentado para evitar duplicados):
/*
INSERT INTO categorias_inventario (id_tenant, nombre, descripcion, icono, color)
SELECT 
  id_tenant,
  'Macetas y Contenedores',
  'Macetas de diferentes tamaños y materiales',
  'flower-pot',
  '#8B4513'
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_inventario 
  WHERE nombre = 'Macetas y Contenedores' 
  AND id_tenant = users.id_tenant
)
GROUP BY id_tenant;

INSERT INTO categorias_inventario (id_tenant, nombre, descripcion, icono, color)
SELECT 
  id_tenant,
  'Sustratos y Tierras',
  'Diferentes tipos de sustratos y mezclas de tierra',
  'mountain',
  '#654321'
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_inventario 
  WHERE nombre = 'Sustratos y Tierras' 
  AND id_tenant = users.id_tenant
)
GROUP BY id_tenant;

INSERT INTO categorias_inventario (id_tenant, nombre, descripcion, icono, color)
SELECT 
  id_tenant,
  'Fertilizantes y Nutrientes',
  'Fertilizantes orgánicos e inorgánicos, nutrientes',
  'droplet',
  '#228B22'
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_inventario 
  WHERE nombre = 'Fertilizantes y Nutrientes' 
  AND id_tenant = users.id_tenant
)
GROUP BY id_tenant;

INSERT INTO categorias_inventario (id_tenant, nombre, descripcion, icono, color)
SELECT 
  id_tenant,
  'Herramientas',
  'Herramientas de jardinería y mantenimiento',
  'wrench',
  '#696969'
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_inventario 
  WHERE nombre = 'Herramientas' 
  AND id_tenant = users.id_tenant
)
GROUP BY id_tenant;

INSERT INTO categorias_inventario (id_tenant, nombre, descripcion, icono, color)
SELECT 
  id_tenant,
  'Semillas y Plantas',
  'Semillas, esquejes y plantas nuevas',
  'sprout',
  '#32CD32'
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_inventario 
  WHERE nombre = 'Semillas y Plantas' 
  AND id_tenant = users.id_tenant
)
GROUP BY id_tenant;

INSERT INTO categorias_inventario (id_tenant, nombre, descripcion, icono, color)
SELECT 
  id_tenant,
  'Productos Fitosanitarios',
  'Insecticidas, fungicidas y otros productos de protección',
  'shield',
  '#DC143C'
FROM users
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_inventario 
  WHERE nombre = 'Productos Fitosanitarios' 
  AND id_tenant = users.id_tenant
)
GROUP BY id_tenant;
*/

-- ============================================
-- 8. COMENTARIOS EN TABLAS
-- ============================================

COMMENT ON TABLE categorias_inventario IS 'Categorías para organizar items de inventario';
COMMENT ON TABLE items_inventario IS 'Items de inventario con control de stock';
COMMENT ON TABLE proveedores IS 'Proveedores de materiales y productos';
COMMENT ON TABLE items_proveedores IS 'Relación entre items y sus proveedores';
COMMENT ON TABLE movimientos_inventario IS 'Historial de movimientos de inventario (entradas/salidas)';

COMMENT ON COLUMN items_inventario.stock_actual IS 'Stock actual del item (actualizado automáticamente por trigger)';
COMMENT ON COLUMN items_inventario.stock_minimo IS 'Nivel mínimo de stock para alertas';
COMMENT ON COLUMN movimientos_inventario.tipo IS 'Tipo de movimiento: entrada, salida o ajuste';
COMMENT ON COLUMN movimientos_inventario.stock_anterior IS 'Stock antes del movimiento';
COMMENT ON COLUMN movimientos_inventario.stock_nuevo IS 'Stock después del movimiento';

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================

-- Verificación de tablas creadas
DO $$
BEGIN
  RAISE NOTICE 'Migración de inventario completada exitosamente';
  RAISE NOTICE 'Tablas creadas:';
  RAISE NOTICE '  - categorias_inventario';
  RAISE NOTICE '  - items_inventario';
  RAISE NOTICE '  - proveedores';
  RAISE NOTICE '  - items_proveedores';
  RAISE NOTICE '  - movimientos_inventario';
  RAISE NOTICE 'Trigger: actualizar_stock_item configurado';
END $$;
