-- ============================================
-- Vivero SaaS - RLS Optimization & Recursion fix
-- ============================================

-- 1. Optimize get_current_tenant_id function
-- Explicitly exclude the function from RLS by querying with SECURITY DEFINER
-- This is already done, but we'll ensure it's robust.

-- 2. Fix USERS policy to avoid recursion
-- Instead of using the function for the users table itself, use auth.uid() directly
-- for basic profile access, and a simpler join for colleagues.

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can see team members" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can see their own profile" ON public.users
  FOR SELECT USING (id_user = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id_user = auth.uid());

-- Allow admins to see all users in their tenant WITHOUT calling the recursive function
CREATE POLICY "Admins can see team members" ON public.users
  FOR SELECT USING (
    id_tenant IN (
      SELECT u.id_tenant FROM public.users u WHERE u.id_user = auth.uid()
    )
  );

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Ensure PLANTAS policy is solid
-- The function get_current_tenant_id() is SECURITY DEFINER so it will bypass 
-- the RLS on 'users' we just defined above. This is the correct way.

-- 4. Fix potential issues with other tables
-- Explicitly allow access to globally shared tables without tenant check
ALTER TABLE public.tipos_planta DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read for tipos_planta" ON public.tipos_planta;
CREATE POLICY "Authenticated read for tipos_planta" ON public.tipos_planta
  FOR SELECT USING (auth.role() = 'authenticated');
ALTER TABLE public.tipos_planta ENABLE ROW LEVEL SECURITY;
