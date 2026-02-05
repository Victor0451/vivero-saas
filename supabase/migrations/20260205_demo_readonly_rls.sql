-- Migration: Protect Demo Tenant Data (Read Only)
-- Tenant ID: 11111111-1111-1111-1111-111111111111

-- 1. Create the Trigger Function
CREATE OR REPLACE FUNCTION public.prevent_demo_modification()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if the operation affects the Demo Tenant
    IF (TG_OP = 'INSERT' AND NEW.id_tenant = '11111111-1111-1111-1111-111111111111') OR
       (TG_OP = 'UPDATE' AND (OLD.id_tenant = '11111111-1111-1111-1111-111111111111' OR NEW.id_tenant = '11111111-1111-1111-1111-111111111111')) OR
       (TG_OP = 'DELETE' AND OLD.id_tenant = '11111111-1111-1111-1111-111111111111') THEN
        RAISE EXCEPTION '⚠️ MODO DEMO: No se permiten modificaciones. (Tenés permisos de solo lectura)';
    END IF;
    
    IF TG_OP = 'DELETE' THEN 
        RETURN OLD;
    ELSE 
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Apply Trigger to Key Tables

-- Plantas
DROP TRIGGER IF EXISTS protect_demo_plantas ON public.plantas;
CREATE TRIGGER protect_demo_plantas
BEFORE INSERT OR UPDATE OR DELETE ON public.plantas
FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_modification();

-- Historia Clinica
DROP TRIGGER IF EXISTS protect_demo_historia ON public.historia_clinica;
CREATE TRIGGER protect_demo_historia
BEFORE INSERT OR UPDATE OR DELETE ON public.historia_clinica
FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_modification();

-- Tareas
DROP TRIGGER IF EXISTS protect_demo_tareas ON public.tareas;
CREATE TRIGGER protect_demo_tareas
BEFORE INSERT OR UPDATE OR DELETE ON public.tareas
FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_modification();

-- Fotos Planta
DROP TRIGGER IF EXISTS protect_demo_fotos ON public.fotos_planta;
CREATE TRIGGER protect_demo_fotos
BEFORE INSERT OR UPDATE OR DELETE ON public.fotos_planta
FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_modification();

-- Generos
DROP TRIGGER IF EXISTS protect_demo_generos ON public.generos_planta;
CREATE TRIGGER protect_demo_generos
BEFORE INSERT OR UPDATE OR DELETE ON public.generos_planta
FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_modification();

-- Macetas
DROP TRIGGER IF EXISTS protect_demo_macetas ON public.macetas;
CREATE TRIGGER protect_demo_macetas
BEFORE INSERT OR UPDATE OR DELETE ON public.macetas
FOR EACH ROW EXECUTE FUNCTION public.prevent_demo_modification();
