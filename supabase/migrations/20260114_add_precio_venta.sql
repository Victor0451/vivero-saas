-- ============================================
-- Vivero SaaS - Inventario: Agregar Precio de Venta
-- Migración: Separar precio de costo y precio de venta
-- Fecha: 2026-01-14
-- ============================================

-- Renombrar columna existente para claridad
ALTER TABLE items_inventario 
RENAME COLUMN precio_unitario TO precio_costo;

-- Agregar nueva columna para precio de venta
ALTER TABLE items_inventario
ADD COLUMN precio_venta DECIMAL(10,2) CHECK (precio_venta IS NULL OR precio_venta >= 0);

-- Actualizar comentarios
COMMENT ON COLUMN items_inventario.precio_costo IS 'Precio de costo/compra del item';
COMMENT ON COLUMN items_inventario.precio_venta IS 'Precio de venta al cliente';

-- Actualizar estadísticas (opcional - para refrescar el planner)
ANALYZE items_inventario;

-- Verificación
DO $$
BEGIN
  RAISE NOTICE 'Migración completada exitosamente';
  RAISE NOTICE 'Columna precio_unitario renombrada a precio_costo';
  RAISE NOTICE 'Columna precio_venta agregada';
END $$;
