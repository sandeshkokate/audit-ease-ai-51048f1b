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
  company_name: string;
  contact_email: string;
  contact_person: string | null;
  contact_phone: string | null;
  gstin: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  status: string | null;
  subscription_plan: string | null;
  commission_percentage: number | null;
  credit_balance: number | null;
  onboarding_date: string | null;
  email_signature: string | null;
  email_tone: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
  updated_by: string | null;
}
