-- Add FK to fotos_planta to link photos to a clinical record
ALTER TABLE fotos_planta 
ADD COLUMN id_historia BIGINT REFERENCES historia_clinica(id_historia) ON DELETE SET NULL;

-- Add FK to tareas to link follow-up tasks to a clinical record
ALTER TABLE tareas 
ADD COLUMN id_historia BIGINT REFERENCES historia_clinica(id_historia) ON DELETE SET NULL;

-- Add severity to historia_clinica for sick plants
ALTER TABLE historia_clinica 
ADD COLUMN severidad TEXT CHECK (severidad IN ('baja', 'media', 'alta', 'critica'));

-- Create indexes for performance
CREATE INDEX idx_fotos_planta_historia ON fotos_planta(id_historia);
CREATE INDEX idx_tareas_historia ON tareas(id_historia);
