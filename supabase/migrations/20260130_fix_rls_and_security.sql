-- ============================================
-- Vivero SaaS - Security Hardening & RLS Standardization
-- ============================================

-- 1. Helper Function to get current tenant id efficiently
-- SECURITY DEFINER is used to allow the function to query public.users even if RLS is enabled on it.
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT id_tenant 
    FROM public.users 
    WHERE id_user = auth.uid()
  );
END;
$$;

-- 2. Standardize RLS for core tables

-- TENANTS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can only see their own tenant" ON public.tenants;
CREATE POLICY "Users can only see their own tenant" ON public.tenants
  FOR SELECT USING (id_tenant = public.get_current_tenant_id());

DROP POLICY IF EXISTS "Admins can update their own tenant" ON public.tenants;
CREATE POLICY "Admins can update their own tenant" ON public.tenants
  FOR UPDATE USING (
    id_tenant = public.get_current_tenant_id() 
    AND (SELECT rol FROM public.users WHERE id_user = auth.uid()) IN ('OWNER', 'ADMIN')
  );

-- USERS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see team members" ON public.users;
CREATE POLICY "Users can see team members" ON public.users
  FOR SELECT USING (id_tenant = public.get_current_tenant_id());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id_user = auth.uid());

-- PLANTAS
ALTER TABLE public.plantas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for plantas" ON public.plantas;
CREATE POLICY "Tenant isolation for plantas" ON public.plantas
  FOR ALL USING (id_tenant = public.get_current_tenant_id());

-- TAREAS
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for tareas" ON public.tareas;
CREATE POLICY "Tenant isolation for tareas" ON public.tareas
  FOR ALL USING (id_tenant = public.get_current_tenant_id());

-- HISTORIA CLINICA
ALTER TABLE public.historia_clinica ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for historia_clinica" ON public.historia_clinica;
CREATE POLICY "Tenant isolation for historia_clinica" ON public.historia_clinica
  FOR ALL USING (id_tenant = public.get_current_tenant_id());

-- MACETAS
ALTER TABLE public.macetas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for macetas" ON public.macetas;
CREATE POLICY "Tenant isolation for macetas" ON public.macetas
  FOR ALL USING (id_tenant = public.get_current_tenant_id());

-- GENEROS PLANTA
ALTER TABLE public.generos_planta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for generos_planta" ON public.generos_planta;
CREATE POLICY "Tenant isolation for generos_planta" ON public.generos_planta
  FOR ALL USING (id_tenant = public.get_current_tenant_id());

-- SUBGENEROS PLANTA
-- Verify if table exists first (it was in docs, checking if created)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subgeneros_planta') THEN
        ALTER TABLE public.subgeneros_planta ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Tenant isolation for subgeneros_planta" ON public.subgeneros_planta;
        EXECUTE 'CREATE POLICY "Tenant isolation for subgeneros_planta" ON public.subgeneros_planta FOR ALL USING (id_tenant = public.get_current_tenant_id())';
    END IF;
END $$;

-- TIPOS PLANTA (Global Read Access)
ALTER TABLE public.tipos_planta ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read for tipos_planta" ON public.tipos_planta;
CREATE POLICY "Authenticated read for tipos_planta" ON public.tipos_planta
  FOR SELECT USING (auth.role() = 'authenticated');

-- NOTIFICACIONES
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for notificaciones" ON public.notificaciones;
CREATE POLICY "Tenant isolation for notificaciones" ON public.notificaciones
  FOR ALL USING (id_tenant = public.get_current_tenant_id());
