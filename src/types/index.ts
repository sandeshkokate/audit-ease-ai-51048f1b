export type UserRole = 'platform_admin' | 'tenant_admin' | 'accountant' | 'viewer';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  tenant_id: string | null;
  phone: string | null;
  is_active: boolean | null;
  last_login: string | null;
  notification_preferences: any | null;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuditRecord {
  id: string;
  tenant_id: string;
  awb_number: string;
  courier: string;
  billed_weight: number;
  actual_weight: number;
  billed_zone: string;
  actual_zone: string;
  billed_amount: number;
  expected_amount: number;
  discrepancy_amount: number;
  discrepancy_type: 'weight' | 'zone' | 'rto' | 'cod' | 'other';
  status: 'detected' | 'disputed' | 'resolved' | 'rejected';
  created_at: string;
}

export interface Dispute {
  id: string;
  tenant_id: string;
  audit_record_id: string;
  courier: string;
  amount: number;
  status: 'draft' | 'sent' | 'acknowledged' | 'resolved' | 'rejected';
  email_content?: string;
  created_at: string;
}

export interface Recovery {
  id: string;
  tenant_id: string;
  dispute_id: string;
  credit_note_number?: string;
  amount: number;
  recovered_at: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  courier: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  status: 'pending' | 'audited' | 'disputed' | 'settled';
}
