
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "u_select_auth_admin" ON public.users;
