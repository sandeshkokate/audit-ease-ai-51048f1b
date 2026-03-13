
-- Drop all RLS policies on users table
DROP POLICY IF EXISTS "u_delete_platform_admin" ON public.users;
DROP POLICY IF EXISTS "u_insert_own" ON public.users;
DROP POLICY IF EXISTS "u_insert_platform_admin" ON public.users;
DROP POLICY IF EXISTS "u_select_own" ON public.users;
DROP POLICY IF EXISTS "u_select_platform_admin" ON public.users;
DROP POLICY IF EXISTS "u_select_same_tenant" ON public.users;
DROP POLICY IF EXISTS "u_update_own" ON public.users;
DROP POLICY IF EXISTS "u_update_platform_admin" ON public.users;
DROP POLICY IF EXISTS "u_update_tenant_admin_team" ON public.users;

-- Disable RLS on users table
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
