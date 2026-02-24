/**
 * Shared action map for activity logs — used by Dashboard and ActivityLogs pages.
 * Keys match the exact `action` values stored in the activity_logs table.
 *
 * Activity logs are populated automatically when:
 * • A shipment CSV is uploaded and processed (each row creates a log)
 * • A billing discrepancy is detected during audit
 * • A dispute is created, updated, or resolved
 * • A dispute email is drafted or sent
 * • A recovery amount is recorded against a dispute
 * • A user logs in or out
 * • A tenant or user is created
 * • Platform settings are changed
 */

export interface ActionInfo {
  label: string;
  description: string;
  color: string;
}

const ACTION_MAP: Record<string, ActionInfo> = {
  // ── Shipment & Audit ───────────────────────────────────
  'Shipment processed':       { label: 'Shipment Processed',     description: 'A shipment was audited and no billing issue found',        color: 'bg-primary/10 text-primary border-primary/20' },
  'Discrepancy detected':     { label: 'Discrepancy Found',      description: 'A billing discrepancy was detected during audit',          color: 'bg-warning/10 text-warning border-warning/20' },

  // ── Disputes ───────────────────────────────────────────
  'Dispute raised':           { label: 'Dispute Raised',         description: 'A billing dispute was raised with the courier',            color: 'bg-destructive/10 text-destructive border-destructive/20' },
  'Dispute draft created':    { label: 'Dispute Drafted',        description: 'A dispute email draft was created for review',             color: 'bg-accent/10 text-accent border-accent/20' },
  'Dispute in progress':      { label: 'Dispute In Progress',    description: 'A dispute is being actively followed up',                  color: 'bg-warning/10 text-warning border-warning/20' },
  'Dispute email copied':     { label: 'Dispute Email Copied',   description: 'A dispute email was copied for sending to the courier',    color: 'bg-secondary/10 text-secondary border-secondary/20' },
  'Dispute resolved':         { label: 'Dispute Resolved',       description: 'A dispute was resolved with the courier',                  color: 'bg-success/10 text-success border-success/20' },
  'Dispute rejected':         { label: 'Dispute Rejected',       description: 'A dispute was rejected by the courier',                    color: 'bg-destructive/10 text-destructive border-destructive/20' },

  // ── Recovery & Financials ──────────────────────────────
  'Recovery recorded':        { label: 'Recovery Recorded',      description: 'A recovery/credit note amount was recorded',               color: 'bg-success/10 text-success border-success/20' },
  'Invoice generated':        { label: 'Invoice Generated',      description: 'A commission invoice was generated',                       color: 'bg-warning/10 text-warning border-warning/20' },

  // ── User & Auth ────────────────────────────────────────
  'User login':               { label: 'User Login',             description: 'A user signed into the platform',                          color: 'bg-primary/10 text-primary border-primary/20' },
  'User logout':              { label: 'User Logout',            description: 'A user signed out of the platform',                        color: 'bg-muted text-muted-foreground border-border' },
  'User created':             { label: 'User Created',           description: 'A new user account was created',                           color: 'bg-success/10 text-success border-success/20' },

  // ── Tenant & Config ────────────────────────────────────
  'Tenant created':           { label: 'Tenant Onboarded',       description: 'A new company was onboarded to the platform',              color: 'bg-primary/10 text-primary border-primary/20' },
  'CSV upload':               { label: 'CSV Uploaded',           description: 'A shipment data file was uploaded for auditing',            color: 'bg-secondary/10 text-secondary border-secondary/20' },
  'Settings updated':         { label: 'Settings Changed',       description: 'Platform or tenant configuration was modified',             color: 'bg-muted text-muted-foreground border-border' },
};

/**
 * Resolve an action string from the DB into a user-friendly label + color.
 * Handles exact match first, then case-insensitive match.
 */
export function getActionInfo(action: string): ActionInfo {
  if (!action) return { label: 'Activity', description: '', color: 'bg-muted text-muted-foreground border-border' };

  // Exact match
  if (ACTION_MAP[action]) return ACTION_MAP[action];

  // Case-insensitive match
  const lower = action.toLowerCase();
  for (const [key, info] of Object.entries(ACTION_MAP)) {
    if (key.toLowerCase() === lower) return info;
  }

  // Fallback — title-case the raw action
  return { label: action, description: '', color: 'bg-muted text-muted-foreground border-border' };
}

/** Parse the JSON `details` field into a friendly one-line summary */
export function formatDetails(raw: string | null | undefined): string {
  if (!raw || raw === '-') return '—';
  try {
    const obj = JSON.parse(raw);
    const parts: string[] = [];
    if (obj.awb) parts.push(`AWB ${obj.awb}`);
    if (obj.courier) parts.push(obj.courier);
    if (obj.amount != null && Number(obj.amount) > 0) parts.push(`₹${Number(obj.amount).toLocaleString('en-IN')}`);
    if (obj.filename) parts.push(obj.filename);
    if (parts.length > 0) return parts.join(' · ');
  } catch {
    // not JSON — return as-is
  }
  return raw.length > 80 ? raw.slice(0, 77) + '…' : raw;
}

/** Map entity_type to a friendly label */
export function formatEntityType(entityType: string | null | undefined): string {
  if (!entityType || entityType === '-') return '—';
  const map: Record<string, string> = {
    'audit_log': 'Shipment Record',
    'upload_batch': 'File Upload',
    'dispute': 'Dispute',
    'dispute_email': 'Dispute Email',
    'user': 'User Account',
    'tenant': 'Tenant',
    'invoice': 'Invoice',
    'credit_note': 'Credit Note',
    'settings': 'Settings',
    'rate_card': 'Rate Card',
  };
  return map[entityType] || entityType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Get all known actions (for legend display) */
export function getAllActions(): ActionInfo[] {
  return Object.values(ACTION_MAP);
}
