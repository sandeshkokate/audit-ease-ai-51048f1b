-- Fix invitations table default role from 'viewer' to 'accountant'
ALTER TABLE public.invitations ALTER COLUMN role SET DEFAULT 'accountant';