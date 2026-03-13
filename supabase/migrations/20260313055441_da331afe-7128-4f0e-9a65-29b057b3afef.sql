
ALTER TABLE public.audit_logs
  ADD COLUMN IF NOT EXISTS origin_city character varying,
  ADD COLUMN IF NOT EXISTS origin_state character varying,
  ADD COLUMN IF NOT EXISTS destination_city character varying,
  ADD COLUMN IF NOT EXISTS destination_state character varying;
