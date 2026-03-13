
-- Helper: notify all users in a tenant (or a specific user)
CREATE OR REPLACE FUNCTION public.notify_tenant_users(
  p_tenant_id uuid,
  p_title text,
  p_message text DEFAULT NULL,
  p_type text DEFAULT 'info',
  p_link text DEFAULT NULL,
  p_only_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_only_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, tenant_id, title, message, type, link)
    VALUES (p_only_user_id, p_tenant_id, p_title, p_message, p_type, p_link);
  ELSE
    INSERT INTO public.notifications (user_id, tenant_id, title, message, type, link)
    SELECT id, p_tenant_id, p_title, p_message, p_type, p_link
    FROM public.users
    WHERE tenant_id = p_tenant_id AND is_active = true;
  END IF;
END;
$$;

-- 1. Trigger: upload batch completed or failed
CREATE OR REPLACE FUNCTION public.trg_notify_upload_batch()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when status changes to completed or failed
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    IF NEW.status = 'completed' THEN
      PERFORM public.notify_tenant_users(
        NEW.tenant_id,
        'CSV upload completed',
        format('File "%s" processed: %s rows, %s discrepancies found.', NEW.filename, COALESCE(NEW.processed_rows, 0), COALESCE(NEW.discrepancy_rows, 0)),
        'success',
        '/tenant/upload-history',
        NEW.created_by
      );
    ELSIF NEW.status = 'failed' THEN
      PERFORM public.notify_tenant_users(
        NEW.tenant_id,
        'CSV upload failed',
        format('File "%s" failed to process. Check upload history for details.', NEW.filename),
        'error',
        '/tenant/upload-history',
        NEW.created_by
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_upload_batch_notify
  AFTER UPDATE ON public.upload_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_upload_batch();

-- 2. Trigger: dispute status changes on audit_logs
CREATE OR REPLACE FUNCTION public.trg_notify_dispute_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.dispute_status IS DISTINCT FROM NEW.dispute_status) THEN
    -- Notify when dispute is raised
    IF NEW.dispute_status = 'raised' THEN
      PERFORM public.notify_tenant_users(
        NEW.tenant_id,
        'Dispute raised',
        format('Dispute raised for order %s (AWB: %s) — ₹%s discrepancy.', NEW.order_id, COALESCE(NEW.awb, 'N/A'), COALESCE(NEW.discrepancy_amount, 0)),
        'warning',
        '/tenant/disputes'
      );
    -- Notify when recovery is recorded
    ELSIF NEW.dispute_status = 'recovered' THEN
      PERFORM public.notify_tenant_users(
        NEW.tenant_id,
        'Recovery recorded',
        format('₹%s recovered for order %s (AWB: %s).', COALESCE(NEW.recovery_amount, 0), NEW.order_id, COALESCE(NEW.awb, 'N/A')),
        'success',
        '/tenant/recoveries'
      );
    -- Notify when dispute is rejected
    ELSIF NEW.dispute_status = 'rejected' THEN
      PERFORM public.notify_tenant_users(
        NEW.tenant_id,
        'Dispute rejected',
        format('Dispute for order %s (AWB: %s) was rejected.', NEW.order_id, COALESCE(NEW.awb, 'N/A')),
        'error',
        '/tenant/disputes'
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_dispute_status_notify
  AFTER UPDATE ON public.audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_dispute_change();

-- 3. Trigger: invitation accepted
CREATE OR REPLACE FUNCTION public.trg_notify_invite_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.invite_status IS DISTINCT FROM NEW.invite_status) AND NEW.invite_status = 'accepted' THEN
    PERFORM public.notify_tenant_users(
      NEW.tenant_id,
      'New team member joined',
      format('%s has accepted the invitation and joined your team.', NEW.email),
      'info',
      '/tenant/team',
      NEW.invited_by
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_invite_accepted_notify
  AFTER UPDATE ON public.invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_notify_invite_accepted();
