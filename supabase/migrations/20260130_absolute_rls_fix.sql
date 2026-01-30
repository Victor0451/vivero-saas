-- ============================================
-- Vivero SaaS - ABSOLUTE RLS FIX
-- ============================================

-- 1. Redefine function as SECURITY DEFINER to break recursion
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (SELECT id_tenant FROM public.users WHERE id_user = auth.uid());
END;
$$;

-- 2. Clean ALL policies on 'users' table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see team members" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can see team members_v2" ON public.users;
DROP POLICY IF EXISTS "Users can see their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can see team members" ON public.users;
DROP POLICY IF EXISTS "users_self_access" ON public.users;
DROP POLICY IF EXISTS "users_tenant_access" ON public.users;
DROP POLICY IF EXISTS "users_self_select" ON public.users;
DROP POLICY IF EXISTS "users_self_update" ON public.users;
DROP POLICY IF EXISTS "users_team_select" ON public.users;

-- 3. Create NEW non-recursive policies
CREATE POLICY "users_read_own" ON public.users FOR SELECT USING (id_user = auth.uid());
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (id_user = auth.uid());
CREATE POLICY "users_read_team" ON public.users FOR SELECT USING (id_tenant = public.get_current_tenant_id());

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 4. Apply to other tables
ALTER TABLE public.plantas DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plantas_tenant_isolation" ON public.plantas;
DROP POLICY IF EXISTS "Tenant isolation for plantas" ON public.plantas;
CREATE POLICY "plantas_isolation" ON public.plantas FOR ALL USING (id_tenant = public.get_current_tenant_id());
ALTER TABLE public.plantas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tareas DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tareas_tenant_isolation" ON public.tareas;
DROP POLICY IF EXISTS "Tenant isolation for tareas" ON public.tareas;
CREATE POLICY "tareas_isolation" ON public.tareas FOR ALL USING (id_tenant = public.get_current_tenant_id());
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO service_role;
