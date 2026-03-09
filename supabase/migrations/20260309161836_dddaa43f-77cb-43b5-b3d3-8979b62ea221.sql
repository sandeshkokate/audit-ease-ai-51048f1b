
-- Fix 1: Prevent tenant_admin from creating platform_admin invitations
DROP POLICY IF EXISTS "inv_insert" ON public.invitations;
CREATE POLICY "inv_insert" ON public.invitations FOR INSERT TO public
  WITH CHECK (
    (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'platform_admin'::text]))
    AND ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text) OR ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)))
    AND (role <> 'platform_admin' OR ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text)
  );

-- Fix 2: Protect email/phone on tenant_admin team updates
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
    AND email IS NOT DISTINCT FROM (SELECT u.email FROM public.users u WHERE u.id = users.id)
    AND phone IS NOT DISTINCT FROM (SELECT u.phone FROM public.users u WHERE u.id = users.id)
  );
