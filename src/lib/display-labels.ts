// =====================================================
// CENTRALIZED DISPLAY LABELS, COLORS & DROPDOWN OPTIONS
// =====================================================
// All pages (AuditLogs, Disputes, Recoveries, Dashboard,
// Reports) MUST import from here. Never define local
// STATUS_LABELS / STATUS_COLORS / TYPE_LABELS duplicates.
// =====================================================

// ─── Dispute / Audit-Log Statuses ────────────────────
// Canonical lifecycle:
//   no_issue → pending/detected → draft → email_copied
//   → raised → recovered / rejected / cancelled
//
// DB aliases: "disputed" ≡ "raised", "resolved" ≡ "recovered"

export const DISPUTE_STATUS_LABELS: Record<string, string> = {
  no_issue: 'No Issue',
  pending: 'Detected',
  detected: 'Detected',
  draft: 'Draft',
  email_copied: 'Email Copied',
  raised: 'Raised',
  disputed: 'Raised',        // alias
  resolved: 'Recovered',     // alias
  recovered: 'Recovered',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

export const DISPUTE_STATUS_COLORS: Record<string, string> = {
  no_issue: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  detected: 'bg-warning/10 text-warning border-warning/20',
  draft: 'bg-muted text-muted-foreground border-border',
  email_copied: 'bg-primary/10 text-primary border-primary/20',
  raised: 'bg-primary/10 text-primary border-primary/20',
  disputed: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-success/10 text-success border-success/20',
  recovered: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

/** Dropdown items for the Audit Logs status filter */
export const AUDIT_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'no_issue', label: 'No Issue' },
  { value: 'detected', label: 'Detected' },
  { value: 'draft', label: 'Draft' },
  { value: 'email_copied', label: 'Email Copied' },
  { value: 'raised', label: 'Raised' },
  { value: 'recovered', label: 'Recovered' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

/** Statuses grouped for the Disputes page tabs */
export const DISPUTE_TAB_STATUSES: Record<string, string[]> = {
  draft: ['draft', 'detected', 'pending', 'email_copied'],
  raised: ['raised', 'disputed'],
  recovered: ['recovered'],
  rejected: ['rejected'],
  cancelled: ['cancelled'],
  all: [],
};

// ─── Discrepancy Types ───────────────────────────────

export const DISCREPANCY_TYPE_LABELS: Record<string, string> = {
  weight: 'Weight',
  zone: 'Zone',
  rto: 'RTO',
  overcharge: 'Rate Overcharge',
  damage: 'Damage',
  unclassified: 'Unclassified',
  no_issue: 'No Issue',
};

/** Dropdown items for the Audit Logs type filter */
export const AUDIT_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'weight', label: 'Weight' },
  { value: 'zone', label: 'Zone' },
  { value: 'rto', label: 'RTO' },
  { value: 'overcharge', label: 'Rate Overcharge' },
  { value: 'damage', label: 'Damage' },
  { value: 'unclassified', label: 'Unclassified' },
  { value: 'no_issue', label: 'No Issue' },
] as const;

/** Dropdown items for the Disputes type filter (excludes damage & no_issue) */
export const DISPUTE_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'weight', label: 'Weight' },
  { value: 'zone', label: 'Zone' },
  { value: 'rto', label: 'RTO' },
  { value: 'overcharge', label: 'Rate Overcharge' },
  { value: 'damage', label: 'Damage' },
  { value: 'unclassified', label: 'Unclassified' },
] as const;

// ─── Status / Type Definitions (help modals) ─────────

export const STATUS_DEFINITIONS = `Status Definitions:
• No Issue — Shipment checked, no billing error found
• Detected — Billing discrepancy found, not yet actioned
• Draft — Dispute email generated, not yet sent
• Email Copied — Dispute email copied, ready to send
• Raised — Dispute email sent to courier
• Recovered — Courier issued credit note, amount recovered
• Rejected — Courier rejected the dispute claim
• Cancelled — Dispute withdrawn

Trigger Points:
• No Issue / Detected: Set automatically on CSV upload
• Draft: Set when dispute email is generated
• Email Copied: Set when user clicks Copy Email in Disputes
• Raised: Set when user clicks Mark as Sent in Disputes
• Recovered: Set manually in Disputes → Mark as Recovered
• Rejected: Set manually in Disputes → Mark as Rejected
• Cancelled: Set when user withdraws the dispute`;

export const TYPE_DEFINITIONS = `Discrepancy Type Definitions:
• Weight — Courier charged more than the actual/volumetric weight
• Zone — Courier applied a higher delivery zone than the correct pincode zone
• RTO — Return-to-origin charges applied incorrectly or at wrong rate
• Rate Overcharge — Forward charge exceeds expected rate card amount for the weight and zone
• Damage — Shipment classified as damaged to inflate charges
• Unclassified — Billing difference detected but type not yet categorised
• No Issue — No billing error found for this shipment`;

// ─── Other Domain Labels ─────────────────────────────

export const TENANT_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
  cancelled: 'Cancelled',
};

export const TENANT_STATUS_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
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
};

export const SUBSCRIPTION_PLAN_LABELS: Record<string, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

/** Credit note / recovery match statuses */
export const RECOVERY_STATUS_LABELS: Record<string, string> = {
  matched: 'Matched',
  review: 'Needs Review',
  unmatched: 'Unmatched',
  recovered: 'Recovered',
};

export const RECOVERY_STATUS_COLORS: Record<string, string> = {
  matched: 'bg-success/10 text-success border-success/20',
  review: 'bg-warning/10 text-warning border-warning/20',
  unmatched: 'bg-destructive/10 text-destructive border-destructive/20',
  recovered: 'bg-success/10 text-success border-success/20',
};

// ─── Generic Helper ──────────────────────────────────

/** Get label from any map with Title Case fallback */
export const getLabel = (
  map: Record<string, string>,
  value: string | null | undefined,
  fallback = 'Unknown',
): string => {
  if (!value) return fallback;
  return (
    map[value.toLowerCase()] ??
    value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
};
