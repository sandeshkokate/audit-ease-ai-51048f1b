
-- ═══════════════════════════════════════════════════
-- P0: Fix inv_update RLS policy (remove OR true hole)
-- ═══════════════════════════════════════════════════
DROP POLICY IF EXISTS "inv_update" ON public.invitations;

CREATE POLICY "inv_update" ON public.invitations
FOR UPDATE
USING (
  ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'platform_admin'::text])
);

-- Security definer RPC so the accept-invite flow can update
-- invitation status without needing tenant_admin/platform_admin role
CREATE OR REPLACE FUNCTION public.accept_invitation(token_value text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv record;
BEGIN
  SELECT * INTO inv FROM public.invitations
  WHERE token = token_value AND invite_status = 'pending'
  LIMIT 1;

  IF inv IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or already used invitation');
  END IF;

  IF inv.expires_at < now() THEN
    UPDATE public.invitations SET invite_status = 'expired' WHERE id = inv.id;
    RETURN json_build_object('success', false, 'error', 'Invitation has expired');
  END IF;

  UPDATE public.invitations
  SET invite_status = 'accepted', accepted_at = now()
  WHERE id = inv.id;

  RETURN json_build_object('success', true, 'invitation_id', inv.id::text);
END;
$$;

-- ═══════════════════════════════════════════════════
-- P0: Rate limiting infrastructure
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup
  ON public.rate_limits(identifier, action, attempted_at);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No direct access — only via security definer function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier text,
  p_action text,
  p_max_attempts int DEFAULT 5,
  p_window_minutes int DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count int;
BEGIN
  -- Clean old entries
  DELETE FROM public.rate_limits
  WHERE attempted_at < now() - (p_window_minutes || ' minutes')::interval;

  -- Count recent attempts
  SELECT COUNT(*) INTO attempt_count
  FROM public.rate_limits
  WHERE identifier = p_identifier
    AND action = p_action
    AND attempted_at > now() - (p_window_minutes || ' minutes')::interval;

  IF attempt_count >= p_max_attempts THEN
    RETURN false;
  END IF;

  -- Record this attempt
  INSERT INTO public.rate_limits (identifier, action) VALUES (p_identifier, p_action);
  RETURN true;
END;
$$;

-- ═══════════════════════════════════════════════════
-- P1: Storage buckets for CSV uploads and invoice PDFs
-- ═══════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('csv-uploads', 'csv-uploads', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('invoice-pdfs', 'invoice-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- CSV upload policies — tenant users can upload/view files scoped to their tenant
CREATE POLICY "csv_upload_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'csv-uploads'
  AND auth.uid() IS NOT NULL
  AND ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'accountant'::text])
);

CREATE POLICY "csv_upload_select" ON storage.objects
FOR SELECT USING (
  bucket_id = 'csv-uploads'
  AND auth.uid() IS NOT NULL
);

-- Invoice PDF policies
CREATE POLICY "invoice_pdf_insert" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'invoice-pdfs'
  AND auth.uid() IS NOT NULL
  AND ((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = ANY (ARRAY['tenant_admin'::text, 'platform_admin'::text, 'accountant'::text])
);

CREATE POLICY "invoice_pdf_select" ON storage.objects
FOR SELECT USING (
  bucket_id = 'invoice-pdfs'
  AND auth.uid() IS NOT NULL
);

-- ═══════════════════════════════════════════════════
-- Audit trail: function to log settings changes
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.log_activity(
  p_action text,
  p_entity_type text DEFAULT NULL,
  p_entity_id uuid DEFAULT NULL,
  p_details text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (
    action, entity_type, entity_id, details,
    old_values, new_values,
    user_id, tenant_id
  ) VALUES (
    p_action, p_entity_type, p_entity_id, p_details,
    p_old_values, p_new_values,
    auth.uid(),
    (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );
END;
$$;
