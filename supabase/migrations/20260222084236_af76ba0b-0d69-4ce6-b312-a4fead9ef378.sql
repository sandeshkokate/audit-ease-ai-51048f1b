
-- Drop self-referencing policies that cause infinite recursion
DROP POLICY IF EXISTS "Only admins can create users" ON public.users;
DROP POLICY IF EXISTS "Platform admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Platform admins full access" ON public.users;
DROP POLICY IF EXISTS "Tenant admins can update team" ON public.users;
DROP POLICY IF EXISTS "Tenant members can view team" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- The following safe policies remain: users_admin_all, users_own_record, users_tenant_team
-- Add missing INSERT policy using get_my_claim
CREATE POLICY "users_insert_self" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id);

-- Add tenant admin update for team members
CREATE POLICY "users_tenant_admin_update" ON public.users
FOR UPDATE USING (
  get_my_claim('role') = 'tenant_admin'
  AND (tenant_id)::text = get_my_claim('tenant_id')
);
