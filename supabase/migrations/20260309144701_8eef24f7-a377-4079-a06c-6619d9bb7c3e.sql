
-- ============================================================
-- 1. Convert ALL RLS policies from RESTRICTIVE to PERMISSIVE
-- 2. Fix u_update_own privilege escalation
-- 3. Restrict platform_settings SELECT to platform_admin
-- 4. Restrict invitation token visibility
-- 5. Fix handle_new_user default role
-- ============================================================

-- ── activity_logs ──────────────────────────────────────────
DROP POLICY IF EXISTS "acl_insert_restricted" ON public.activity_logs;
DROP POLICY IF EXISTS "acl_select_platform_admin" ON public.activity_logs;
DROP POLICY IF EXISTS "acl_select_tenant" ON public.activity_logs;

CREATE POLICY "acl_insert" ON public.activity_logs FOR INSERT TO public
  WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "acl_select_platform_admin" ON public.activity_logs FOR SELECT TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "acl_select_tenant" ON public.activity_logs FOR SELECT TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    AND (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'accountant'::text])));

-- ── audit_logs ─────────────────────────────────────────────
DROP POLICY IF EXISTS "al_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "al_select" ON public.audit_logs;
DROP POLICY IF EXISTS "al_update" ON public.audit_logs;

CREATE POLICY "al_insert" ON public.audit_logs FOR INSERT TO public
  WITH CHECK (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "al_select" ON public.audit_logs FOR SELECT TO public
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text)
    OR ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)));

CREATE POLICY "al_update" ON public.audit_logs FOR UPDATE TO public
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text)
    OR (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
      AND (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'accountant'::text]))));

-- ── courier_master ─────────────────────────────────────────
DROP POLICY IF EXISTS "cm_read" ON public.courier_master;
DROP POLICY IF EXISTS "cm_write" ON public.courier_master;

CREATE POLICY "cm_read" ON public.courier_master FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "cm_write" ON public.courier_master FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── courier_rate_cards ─────────────────────────────────────
DROP POLICY IF EXISTS "crc_read" ON public.courier_rate_cards;
DROP POLICY IF EXISTS "crc_write" ON public.courier_rate_cards;

CREATE POLICY "crc_read" ON public.courier_rate_cards FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "crc_write" ON public.courier_rate_cards FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── credit_notes ───────────────────────────────────────────
DROP POLICY IF EXISTS "cn_all" ON public.credit_notes;

CREATE POLICY "cn_all" ON public.credit_notes FOR ALL TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

-- ── dispute_emails ─────────────────────────────────────────
DROP POLICY IF EXISTS "de_all" ON public.dispute_emails;

CREATE POLICY "de_all" ON public.dispute_emails FOR ALL TO public
  USING (EXISTS (
    SELECT 1 FROM audit_logs al
    WHERE al.id = dispute_emails.audit_log_id
      AND (((al.tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
        OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text))
  ));

-- ── dispute_notes ──────────────────────────────────────────
DROP POLICY IF EXISTS "dn_all" ON public.dispute_notes;

CREATE POLICY "dn_all" ON public.dispute_notes FOR ALL TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

-- ── email_templates ────────────────────────────────────────
DROP POLICY IF EXISTS "et_read" ON public.email_templates;
DROP POLICY IF EXISTS "et_write" ON public.email_templates;

CREATE POLICY "et_read" ON public.email_templates FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "et_write" ON public.email_templates FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── feature_flags ──────────────────────────────────────────
DROP POLICY IF EXISTS "ff_read" ON public.feature_flags;
DROP POLICY IF EXISTS "ff_write" ON public.feature_flags;

CREATE POLICY "ff_read" ON public.feature_flags FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "ff_write" ON public.feature_flags FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── invitations (fix #5: restrict token visibility) ────────
DROP POLICY IF EXISTS "inv_insert" ON public.invitations;
DROP POLICY IF EXISTS "inv_select_authenticated" ON public.invitations;
DROP POLICY IF EXISTS "inv_update" ON public.invitations;

CREATE POLICY "inv_insert" ON public.invitations FOR INSERT TO public
  WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'platform_admin'::text]))
    AND ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text)
      OR ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))));

-- Token column excluded from select for non-admin: use security definer for acceptance
CREATE POLICY "inv_select_admin" ON public.invitations FOR SELECT TO authenticated
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['platform_admin'::text, 'tenant_admin'::text]))
    AND ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text)
      OR ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))));

CREATE POLICY "inv_update" ON public.invitations FOR UPDATE TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'platform_admin'::text]));

-- ── invoices ───────────────────────────────────────────────
DROP POLICY IF EXISTS "inv_insert" ON public.invoices;
DROP POLICY IF EXISTS "inv_select" ON public.invoices;
DROP POLICY IF EXISTS "inv_update" ON public.invoices;

CREATE POLICY "inv_insert" ON public.invoices FOR INSERT TO public
  WITH CHECK (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "inv_select" ON public.invoices FOR SELECT TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "inv_update" ON public.invoices FOR UPDATE TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'platform_admin'::text]));

-- ── leads ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "leads_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_read" ON public.leads;

CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "leads_read" ON public.leads FOR SELECT TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── notifications ──────────────────────────────────────────
DROP POLICY IF EXISTS "notif_own" ON public.notifications;

CREATE POLICY "notif_own" ON public.notifications FOR ALL TO public
  USING (user_id = auth.uid());

-- ── pincode_zone_master ────────────────────────────────────
DROP POLICY IF EXISTS "pzm_read" ON public.pincode_zone_master;
DROP POLICY IF EXISTS "pzm_write" ON public.pincode_zone_master;

CREATE POLICY "pzm_read" ON public.pincode_zone_master FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "pzm_write" ON public.pincode_zone_master FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── platform_settings (fix #3: restrict to platform_admin only) ──
DROP POLICY IF EXISTS "ps_read" ON public.platform_settings;
DROP POLICY IF EXISTS "ps_write" ON public.platform_settings;

CREATE POLICY "ps_read" ON public.platform_settings FOR SELECT TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "ps_write" ON public.platform_settings FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── rate_cards ─────────────────────────────────────────────
DROP POLICY IF EXISTS "rc_select" ON public.rate_cards;
DROP POLICY IF EXISTS "rc_write" ON public.rate_cards;

CREATE POLICY "rc_select" ON public.rate_cards FOR SELECT TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "rc_write" ON public.rate_cards FOR ALL TO public
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'platform_admin'::text]))
    AND ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)));

-- ── rate_limits ────────────────────────────────────────────
DROP POLICY IF EXISTS "rl_delete_admin" ON public.rate_limits;
DROP POLICY IF EXISTS "rl_insert_anon" ON public.rate_limits;
DROP POLICY IF EXISTS "rl_select_admin" ON public.rate_limits;

CREATE POLICY "rl_delete_admin" ON public.rate_limits FOR DELETE TO authenticated
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "rl_insert_anon" ON public.rate_limits FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "rl_select_admin" ON public.rate_limits FOR SELECT TO authenticated
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── tenant_feature_access ──────────────────────────────────
DROP POLICY IF EXISTS "tfa_read" ON public.tenant_feature_access;
DROP POLICY IF EXISTS "tfa_write" ON public.tenant_feature_access;

CREATE POLICY "tfa_read" ON public.tenant_feature_access FOR SELECT TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "tfa_write" ON public.tenant_feature_access FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── tenants ────────────────────────────────────────────────
DROP POLICY IF EXISTS "ten_insert_platform_admin" ON public.tenants;
DROP POLICY IF EXISTS "ten_select_own" ON public.tenants;
DROP POLICY IF EXISTS "ten_select_platform_admin" ON public.tenants;
DROP POLICY IF EXISTS "ten_update_own_tenant_admin" ON public.tenants;
DROP POLICY IF EXISTS "ten_update_platform_admin" ON public.tenants;

CREATE POLICY "ten_insert_platform_admin" ON public.tenants FOR INSERT TO public
  WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "ten_select_own" ON public.tenants FOR SELECT TO public
  USING ((id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text));

CREATE POLICY "ten_select_platform_admin" ON public.tenants FOR SELECT TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "ten_update_own_tenant_admin" ON public.tenants FOR UPDATE TO public
  USING (((id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    AND (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'tenant_admin'::text));

CREATE POLICY "ten_update_platform_admin" ON public.tenants FOR UPDATE TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── upload_batches ─────────────────────────────────────────
DROP POLICY IF EXISTS "ub_all" ON public.upload_batches;

CREATE POLICY "ub_all" ON public.upload_batches FOR ALL TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

-- ── users (fix #2: privilege escalation) ───────────────────
DROP POLICY IF EXISTS "u_delete_platform_admin" ON public.users;
DROP POLICY IF EXISTS "u_insert_own" ON public.users;
DROP POLICY IF EXISTS "u_insert_platform_admin" ON public.users;
DROP POLICY IF EXISTS "u_select_own" ON public.users;
DROP POLICY IF EXISTS "u_select_platform_admin" ON public.users;
DROP POLICY IF EXISTS "u_select_same_tenant" ON public.users;
DROP POLICY IF EXISTS "u_update_own" ON public.users;
DROP POLICY IF EXISTS "u_update_platform_admin" ON public.users;
DROP POLICY IF EXISTS "u_update_tenant_admin_team" ON public.users;

CREATE POLICY "u_delete_platform_admin" ON public.users FOR DELETE TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "u_insert_own" ON public.users FOR INSERT TO public
  WITH CHECK (auth.uid() = id);

CREATE POLICY "u_insert_platform_admin" ON public.users FOR INSERT TO public
  WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "u_select_own" ON public.users FOR SELECT TO public
  USING (auth.uid() = id);

CREATE POLICY "u_select_platform_admin" ON public.users FOR SELECT TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "u_select_same_tenant" ON public.users FOR SELECT TO public
  USING ((tenant_id IS NOT NULL) AND ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)));

-- FIX: u_update_own now restricts to safe columns only via a trigger
CREATE POLICY "u_update_own" ON public.users FOR UPDATE TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "u_update_platform_admin" ON public.users FOR UPDATE TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "u_update_tenant_admin_team" ON public.users FOR UPDATE TO public
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'tenant_admin'::text)
    AND ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))
    AND (id <> auth.uid()));

-- ── zone_master ────────────────────────────────────────────
DROP POLICY IF EXISTS "zm_read" ON public.zone_master;
DROP POLICY IF EXISTS "zm_write" ON public.zone_master;

CREATE POLICY "zm_read" ON public.zone_master FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "zm_write" ON public.zone_master FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ============================================================
-- TRIGGER: Prevent non-admin users from escalating privileges
-- ============================================================
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  caller_role text;
BEGIN
  caller_role := COALESCE((current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role'), '');
  
  -- Platform admins can change anything
  IF caller_role = 'platform_admin' THEN
    RETURN NEW;
  END IF;

  -- Tenant admins can change role for team members (handled by RLS)
  IF caller_role = 'tenant_admin' AND NEW.id <> auth.uid() THEN
    RETURN NEW;
  END IF;

  -- For self-updates by non-admin users: block changes to sensitive columns
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Cannot change your own role';
  END IF;
  IF NEW.tenant_id IS DISTINCT FROM OLD.tenant_id THEN
    RAISE EXCEPTION 'Cannot change your own tenant';
  END IF;
  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    RAISE EXCEPTION 'Cannot change your own active status';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.users;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_escalation();

-- ============================================================
-- FIX: handle_new_user default role from 'viewer' → 'accountant'
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, tenant_id, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'accountant'),
    (NEW.raw_user_meta_data ->> 'tenant_id')::uuid,
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$;
