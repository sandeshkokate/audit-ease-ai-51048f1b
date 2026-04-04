
-- Delete dispute-related data first (references audit_logs)
DELETE FROM dispute_emails;
DELETE FROM dispute_notes;

-- Delete audit logs
DELETE FROM audit_logs;

-- Delete upload batches
DELETE FROM upload_batches;

-- Delete credit notes
DELETE FROM credit_notes;
