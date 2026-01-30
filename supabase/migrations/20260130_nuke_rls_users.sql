-- ============================================
-- Vivero SaaS - NUKE & RESET RLS FOR USERS
-- ============================================

-- 1. Disable RLS temporarily to avoid any triggers
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. DYNAMICALLY DELETE ALL EXISTING POLICIES on 'users'
-- Since we might not know all names (overlapping tasks), we use this DO block.
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY %I ON public.users', pol.policyname);
    END LOOP;
END $$;

-- 3. Redefine the function to be SECURE and NOT CALL POLICIES
-- SECURITY DEFINER makes it run as the owner, bypassing RLS.
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  _tenant_id uuid;
BEGIN
  -- We query the table directly. As owner (SECURITY DEFINER), 
  -- this does NOT trigger policies on 'users'.
  SELECT id_tenant INTO _tenant_id
  FROM public.users
  WHERE id_user = auth.uid();
  
  RETURN _tenant_id;
END;
$$;

-- 4. Create minimalist, non-recursive policies
-- POLICY 1: Own data (Direct check)
CREATE POLICY "users_self_access" ON public.users
  FOR ALL USING (id_user = auth.uid());

-- POLICY 2: Teammates (Use the safe function)
-- This function is SECURITY DEFINER, so it breaks the recursion chain.
CREATE POLICY "users_tenant_access" ON public.users
  FOR SELECT USING (id_tenant = public.get_current_tenant_id());

-- 5. Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO service_role;
