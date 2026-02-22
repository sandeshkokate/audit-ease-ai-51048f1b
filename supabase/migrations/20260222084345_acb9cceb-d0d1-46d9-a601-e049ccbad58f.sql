
-- Fix feature_flags self-referencing policy
DROP POLICY IF EXISTS "feature_flags_write" ON public.feature_flags;
CREATE POLICY "feature_flags_write" ON public.feature_flags
FOR ALL USING (get_my_claim('role') = 'platform_admin')
WITH CHECK (get_my_claim('role') = 'platform_admin');

-- Fix platform_settings self-referencing policies
DROP POLICY IF EXISTS "Platform admins can manage settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Platform admins can read settings" ON public.platform_settings;

-- Fix tenants self-referencing policies
DROP POLICY IF EXISTS "Platform admins can create tenants" ON public.tenants;
CREATE POLICY "tenants_admin_insert" ON public.tenants
FOR INSERT WITH CHECK (get_my_claim('role') = 'platform_admin');

DROP POLICY IF EXISTS "Tenant admins can update own tenant" ON public.tenants;
CREATE POLICY "tenants_own_update" ON public.tenants
FOR UPDATE USING ((id)::text = get_my_claim('tenant_id'));

-- Enable RLS on tables missing it
ALTER TABLE public.courier_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "courier_master_read" ON public.courier_master FOR SELECT USING (true);

ALTER TABLE public.pincode_zone_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pincode_zone_master_read" ON public.pincode_zone_master FOR SELECT USING (true);
