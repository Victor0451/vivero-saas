-- ============================================
-- Vivero SaaS - Macetas Units Migration
-- Agregar columnas de unidades para medidas
-- ============================================

-- Agregar columnas de unidades a la tabla macetas
ALTER TABLE macetas
ADD COLUMN IF NOT EXISTS diametro_unidad VARCHAR(10) DEFAULT 'cm';

ALTER TABLE macetas
ADD COLUMN IF NOT EXISTS altura_unidad VARCHAR(10) DEFAULT 'cm';

ALTER TABLE macetas
ADD COLUMN IF NOT EXISTS volumen_unidad VARCHAR(10) DEFAULT 'L';

-- Comentarios para documentación
COMMENT ON COLUMN macetas.diametro_unidad IS 'Unidad de medida del diámetro: cm, in, mm';
COMMENT ON COLUMN macetas.altura_unidad IS 'Unidad de medida de la altura: cm, in, mm';
COMMENT ON COLUMN macetas.volumen_unidad IS 'Unidad de medida del volumen: L, ml, gal';
