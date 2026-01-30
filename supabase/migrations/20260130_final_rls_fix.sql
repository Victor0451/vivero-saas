-- ============================================
-- Vivero SaaS - FINAL RLS Recursion Fix
-- ============================================

-- 1. Redefine the helper function to be extremely robust
-- We ensure it's SECURITY DEFINER to bypass RLS on the 'users' table.
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
BEGIN
  SELECT id_tenant INTO _tenant_id
  FROM public.users
  WHERE id_user = auth.uid();
  
  RETURN _tenant_id;
END;
$$;

-- 2. Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO service_role;

-- 3. Reset policies for 'users' table to avoid calling itself recursively
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see team members" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can see team members_v2" ON public.users;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can see team members" ON public.users;

-- Policy A: Every user can see their own record (Direct check, no recursion)
CREATE POLICY "users_self_select" ON public.users
  FOR SELECT USING (id_user = auth.uid());

-- Policy B: Every user can update their own profile (Direct check)
CREATE POLICY "users_self_update" ON public.users
  FOR UPDATE USING (id_user = auth.uid());

-- Policy C: Users can see teammates (This used to cause loop)
-- To break the loop, we use a subquery that is EXEMPT from RLS checks 
-- by using the SECURITY DEFINER function WE JUST DEFINED.
CREATE POLICY "users_team_select" ON public.users
  FOR SELECT USING (id_tenant = public.get_current_tenant_id());

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Verify other core tables (using the now safe function)
ALTER TABLE public.plantas DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for plantas" ON public.plantas;
CREATE POLICY "plantas_tenant_isolation" ON public.plantas
  FOR ALL USING (id_tenant = public.get_current_tenant_id());
ALTER TABLE public.plantas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tareas DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for tareas" ON public.tareas;
CREATE POLICY "tareas_tenant_isolation" ON public.tareas
  FOR ALL USING (id_tenant = public.get_current_tenant_id());
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.generos_planta DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for generos_planta" ON public.generos_planta;
CREATE POLICY "generos_tenant_isolation" ON public.generos_planta
  FOR ALL USING (id_tenant = public.get_current_tenant_id());
ALTER TABLE public.generos_planta ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.macetas DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for macetas" ON public.macetas;
CREATE POLICY "macetas_tenant_isolation" ON public.macetas
  FOR ALL USING (id_tenant = public.get_current_tenant_id());
ALTER TABLE public.macetas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.historia_clinica DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for historia_clinica" ON public.historia_clinica;
CREATE POLICY "historia_tenant_isolation" ON public.historia_clinica
  FOR ALL USING (id_tenant = public.get_current_tenant_id());
ALTER TABLE public.historia_clinica ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notificaciones DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tenant isolation for notificaciones" ON public.notificaciones;
CREATE POLICY "notificaciones_tenant_isolation" ON public.notificaciones
  FOR ALL USING (id_tenant = public.get_current_tenant_id());
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Subgeneros (optional but recommended)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subgeneros_planta') THEN
        ALTER TABLE public.subgeneros_planta DISABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Tenant isolation for subgeneros_planta" ON public.subgeneros_planta;
        EXECUTE 'CREATE POLICY "subgeneros_tenant_isolation" ON public.subgeneros_planta FOR ALL USING (id_tenant = public.get_current_tenant_id())';
        ALTER TABLE public.subgeneros_planta ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 5. Ensure global tables are accessible
ALTER TABLE public.tipos_planta DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read for tipos_planta" ON public.tipos_planta;
CREATE POLICY "tipos_global_read" ON public.tipos_planta
  FOR SELECT USING (auth.role() = 'authenticated');
ALTER TABLE public.tipos_planta ENABLE ROW LEVEL SECURITY;
