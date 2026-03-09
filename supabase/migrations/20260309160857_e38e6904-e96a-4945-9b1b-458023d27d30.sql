
-- ============================================================
-- CRITICAL FIX 1: Convert ALL 54 RESTRICTIVE policies to PERMISSIVE
-- CRITICAL FIX 2: Add tenant_id checks to inv_update on invoices & invitations
-- RECOMMENDED FIX 3: Restrict u_update_own to safe columns via WITH CHECK
-- ============================================================

-- ── activity_logs ──
DROP POLICY IF EXISTS "acl_insert" ON public.activity_logs;
DROP POLICY IF EXISTS "acl_select_platform_admin" ON public.activity_logs;
DROP POLICY IF EXISTS "acl_select_tenant" ON public.activity_logs;

CREATE POLICY "acl_insert" ON public.activity_logs FOR INSERT TO public
  WITH CHECK (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "acl_select_platform_admin" ON public.activity_logs FOR SELECT TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "acl_select_tenant" ON public.activity_logs FOR SELECT TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) AND (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'accountant'::text])));

-- ── audit_logs ──
DROP POLICY IF EXISTS "al_insert" ON public.audit_logs;
DROP POLICY IF EXISTS "al_select" ON public.audit_logs;
DROP POLICY IF EXISTS "al_update" ON public.audit_logs;

CREATE POLICY "al_insert" ON public.audit_logs FOR INSERT TO public
  WITH CHECK (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "al_select" ON public.audit_logs FOR SELECT TO public
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text) OR ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)));

CREATE POLICY "al_update" ON public.audit_logs FOR UPDATE TO public
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text) OR (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) AND (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'accountant'::text]))));

-- ── courier_master ──
DROP POLICY IF EXISTS "cm_read" ON public.courier_master;
DROP POLICY IF EXISTS "cm_write" ON public.courier_master;

CREATE POLICY "cm_read" ON public.courier_master FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "cm_write" ON public.courier_master FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── courier_rate_cards ──
DROP POLICY IF EXISTS "crc_read" ON public.courier_rate_cards;
DROP POLICY IF EXISTS "crc_write" ON public.courier_rate_cards;

CREATE POLICY "crc_read" ON public.courier_rate_cards FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "crc_write" ON public.courier_rate_cards FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── credit_notes ──
DROP POLICY IF EXISTS "cn_all" ON public.credit_notes;

CREATE POLICY "cn_all" ON public.credit_notes FOR ALL TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

-- ── dispute_emails ──
DROP POLICY IF EXISTS "de_all" ON public.dispute_emails;

CREATE POLICY "de_all" ON public.dispute_emails FOR ALL TO public
  USING (EXISTS (SELECT 1 FROM audit_logs al WHERE al.id = dispute_emails.audit_log_id AND (((al.tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text))));

-- ── dispute_notes ──
DROP POLICY IF EXISTS "dn_all" ON public.dispute_notes;

CREATE POLICY "dn_all" ON public.dispute_notes FOR ALL TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

-- ── email_templates ──
DROP POLICY IF EXISTS "et_read" ON public.email_templates;
DROP POLICY IF EXISTS "et_write" ON public.email_templates;

CREATE POLICY "et_read" ON public.email_templates FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "et_write" ON public.email_templates FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── feature_flags ──
DROP POLICY IF EXISTS "ff_read" ON public.feature_flags;
DROP POLICY IF EXISTS "ff_write" ON public.feature_flags;

CREATE POLICY "ff_read" ON public.feature_flags FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "ff_write" ON public.feature_flags FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── invitations (CRITICAL FIX 2: add tenant_id to inv_update) ──
DROP POLICY IF EXISTS "inv_insert" ON public.invitations;
DROP POLICY IF EXISTS "inv_select_admin" ON public.invitations;
DROP POLICY IF EXISTS "inv_update" ON public.invitations;

CREATE POLICY "inv_insert" ON public.invitations FOR INSERT TO public
  WITH CHECK ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'platform_admin'::text])) AND ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text) OR ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))));

CREATE POLICY "inv_select_admin" ON public.invitations FOR SELECT TO authenticated
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['platform_admin'::text, 'tenant_admin'::text])) AND ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text) OR ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text))));

CREATE POLICY "inv_update" ON public.invitations FOR UPDATE TO public
  USING (
    (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text)
    OR
    ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'tenant_admin'::text) AND ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)))
  );

-- ── invoices (CRITICAL FIX 2: add tenant_id to inv_update) ──
DROP POLICY IF EXISTS "inv_insert" ON public.invoices;
DROP POLICY IF EXISTS "inv_select" ON public.invoices;
DROP POLICY IF EXISTS "inv_update" ON public.invoices;

CREATE POLICY "inv_insert" ON public.invoices FOR INSERT TO public
  WITH CHECK (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "inv_select" ON public.invoices FOR SELECT TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "inv_update" ON public.invoices FOR UPDATE TO public
  USING (
    (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text)
    OR
    ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'tenant_admin'::text) AND ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)))
  );

-- ── leads ──
DROP POLICY IF EXISTS "leads_insert" ON public.leads;
DROP POLICY IF EXISTS "leads_read" ON public.leads;

CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "leads_read" ON public.leads FOR SELECT TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── notifications ──
DROP POLICY IF EXISTS "notif_own" ON public.notifications;

CREATE POLICY "notif_own" ON public.notifications FOR ALL TO public
  USING (user_id = auth.uid());

-- ── pincode_zone_master ──
DROP POLICY IF EXISTS "pzm_read" ON public.pincode_zone_master;
DROP POLICY IF EXISTS "pzm_write" ON public.pincode_zone_master;

CREATE POLICY "pzm_read" ON public.pincode_zone_master FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "pzm_write" ON public.pincode_zone_master FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── platform_settings ──
DROP POLICY IF EXISTS "ps_read" ON public.platform_settings;
DROP POLICY IF EXISTS "ps_write" ON public.platform_settings;

CREATE POLICY "ps_read" ON public.platform_settings FOR SELECT TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "ps_write" ON public.platform_settings FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── rate_cards ──
DROP POLICY IF EXISTS "rc_select" ON public.rate_cards;
DROP POLICY IF EXISTS "rc_write" ON public.rate_cards;

CREATE POLICY "rc_select" ON public.rate_cards FOR SELECT TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "rc_write" ON public.rate_cards FOR ALL TO public
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'platform_admin'::text])) AND ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)));

-- ── rate_limits ──
DROP POLICY IF EXISTS "rl_delete_admin" ON public.rate_limits;
DROP POLICY IF EXISTS "rl_insert_anon" ON public.rate_limits;
DROP POLICY IF EXISTS "rl_select_admin" ON public.rate_limits;

CREATE POLICY "rl_delete_admin" ON public.rate_limits FOR DELETE TO authenticated
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "rl_insert_anon" ON public.rate_limits FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "rl_select_admin" ON public.rate_limits FOR SELECT TO authenticated
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── tenant_feature_access ──
DROP POLICY IF EXISTS "tfa_read" ON public.tenant_feature_access;
DROP POLICY IF EXISTS "tfa_write" ON public.tenant_feature_access;

CREATE POLICY "tfa_read" ON public.tenant_feature_access FOR SELECT TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

CREATE POLICY "tfa_write" ON public.tenant_feature_access FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── tenants ──
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
  USING (((id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) AND (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'tenant_admin'::text));

CREATE POLICY "ten_update_platform_admin" ON public.tenants FOR UPDATE TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

-- ── upload_batches ──
DROP POLICY IF EXISTS "ub_all" ON public.upload_batches;

CREATE POLICY "ub_all" ON public.upload_batches FOR ALL TO public
  USING (((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text));

-- ── users (RECOMMENDED FIX 3: restrict u_update_own with WITH CHECK) ──
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

-- RECOMMENDED FIX: u_update_own now has WITH CHECK ensuring role, tenant_id, is_active unchanged
-- (The trigger trg_prevent_role_escalation is backup defense-in-depth)
CREATE POLICY "u_update_own" ON public.users FOR UPDATE TO public
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT u.role FROM public.users u WHERE u.id = auth.uid())
    AND tenant_id IS NOT DISTINCT FROM (SELECT u.tenant_id FROM public.users u WHERE u.id = auth.uid())
    AND is_active = (SELECT u.is_active FROM public.users u WHERE u.id = auth.uid())
  );

CREATE POLICY "u_update_platform_admin" ON public.users FOR UPDATE TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);

CREATE POLICY "u_update_tenant_admin_team" ON public.users FOR UPDATE TO public
  USING ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'tenant_admin'::text) AND ((tenant_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'tenant_id'::text)) AND (id <> auth.uid()));

-- ── zone_master ──
DROP POLICY IF EXISTS "zm_read" ON public.zone_master;
DROP POLICY IF EXISTS "zm_write" ON public.zone_master;

CREATE POLICY "zm_read" ON public.zone_master FOR SELECT TO public
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "zm_write" ON public.zone_master FOR ALL TO public
  USING (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'platform_admin'::text);
