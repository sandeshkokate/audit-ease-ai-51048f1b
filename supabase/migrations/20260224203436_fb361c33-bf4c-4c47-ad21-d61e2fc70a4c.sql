
-- P0: Fix inv_select_all permissive policy — restrict to authenticated users only
DROP POLICY IF EXISTS "inv_select_all" ON public.invitations;
CREATE POLICY "inv_select_authenticated" ON public.invitations
  FOR SELECT TO authenticated
  USING (
    ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) IN ('platform_admin', 'tenant_admin')
    OR (tenant_id::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
  );

-- P0: Add RLS policies to rate_limits table (currently has none)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rl_insert_anon" ON public.rate_limits
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "rl_select_admin" ON public.rate_limits
  FOR SELECT TO authenticated
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin');

CREATE POLICY "rl_delete_admin" ON public.rate_limits
  FOR DELETE TO authenticated
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin');

-- Fix search_path on expire_old_invitations
CREATE OR REPLACE FUNCTION public.expire_old_invitations()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH updated AS (
    UPDATE public.invitations
    SET invite_status = 'expired'
    WHERE invite_status = 'pending' AND expires_at < now()
    RETURNING id
  )
  SELECT COUNT(*)::integer FROM updated;
$$;

-- Fix search_path on set_updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- Fix search_path on update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix search_path on get_my_claim
CREATE OR REPLACE FUNCTION public.get_my_claim(claim text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> claim),
    ''
  );
$$;
