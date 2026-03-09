
-- Fix: Prevent tenant_admin from escalating privileges of team members
DROP POLICY IF EXISTS "u_update_tenant_admin_team" ON public.users;

CREATE POLICY "u_update_tenant_admin_team" ON public.users FOR UPDATE TO public
  USING (
    (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'tenant_admin'::text)
    AND ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    AND (id <> auth.uid())
  )
  WITH CHECK (
    role IS NOT DISTINCT FROM (SELECT u.role FROM public.users u WHERE u.id = users.id)
    AND tenant_id IS NOT DISTINCT FROM (SELECT u.tenant_id FROM public.users u WHERE u.id = users.id)
    AND is_active IS NOT DISTINCT FROM (SELECT u.is_active FROM public.users u WHERE u.id = users.id)
  );
