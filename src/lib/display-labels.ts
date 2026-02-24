export const DISPUTE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  raised: 'Raised',
  email_copied: 'Email Copied',
  recovered: 'Recovered',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  disputed: 'Disputed',
  detected: 'Detected',
};

export const TENANT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
  cancelled: 'Cancelled',
};

export const INVOICE_STATUS_LABELS: Record<string, string> = {
  generated: 'Generated',
  pending: 'Pending',
  paid: 'Paid',
  overdue: 'Overdue',
};

export const UPLOAD_STATUS_LABELS: Record<string, string> = {
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  pending: 'Pending',
};

export const INVITE_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  expired: 'Expired',
  cancelled: 'Cancelled',
};

export const ROLE_LABELS: Record<string, string> = {
  platform_admin: 'Platform Admin',
  tenant_admin: 'Tenant Admin',
  accountant: 'Accountant',
  viewer: 'Viewer',
};

export const DISCREPANCY_TYPE_LABELS: Record<string, string> = {
  weight: 'Weight',
  zone: 'Zone',
  rto: 'RTO',
  damage: 'Damage',
};

export const SUBSCRIPTION_PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

// Helper: get label with fallback, capitalises unknown values as Title Case
export const getLabel = (map: Record<string, string>, value: string | null | undefined, fallback = 'Unknown'): string => {
  if (!value) return fallback;
  return map[value.toLowerCase()] ?? value.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
