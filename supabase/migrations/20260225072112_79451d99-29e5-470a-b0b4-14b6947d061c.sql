
-- Issue #1: Harden activity_logs — remove direct INSERT from clients
-- Only the log_activity SECURITY DEFINER RPC should insert.
-- Drop the current permissive insert policy and replace with one 
-- that restricts to platform_admin only (RPC bypasses RLS via SECURITY DEFINER).

DROP POLICY IF EXISTS "acl_insert" ON public.activity_logs;

CREATE POLICY "acl_insert_restricted"
ON public.activity_logs
FOR INSERT
WITH CHECK (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text
);

-- Also clean up the viewer reference in the tenant select policy
DROP POLICY IF EXISTS "acl_select_tenant" ON public.activity_logs;

CREATE POLICY "acl_select_tenant"
ON public.activity_logs
FOR SELECT
USING (
  (tenant_id::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
  AND (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'accountant'::text]))
);
