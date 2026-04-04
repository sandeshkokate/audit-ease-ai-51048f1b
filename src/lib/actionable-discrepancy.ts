export interface ActionableDiscrepancyRecord {
  overcharge_amount?: number | null;
  status?: string | null;
  discrepancy_type?: string | null;
}

export function hasActionableDiscrepancy(record: Pick<ActionableDiscrepancyRecord, 'overcharge_amount'>): boolean {
  return (record.overcharge_amount ?? 0) > 1;
}

export function getActionableDiscrepancyType(record: ActionableDiscrepancyRecord): 'weight' | 'zone' | 'rto' | 'overcharge' | 'unclassified' | 'no_issue' {
  if (!hasActionableDiscrepancy(record)) return 'no_issue';
  const t = record.discrepancy_type?.toLowerCase() ?? '';
  if (t === 'weight') return 'weight';
  if (t === 'zone') return 'zone';
  if (t === 'rto') return 'rto';
  if (t === 'overcharge') return 'overcharge';
  return 'unclassified';
}

export function getActionableDiscrepancyStatus(record: ActionableDiscrepancyRecord): string {
  if (!hasActionableDiscrepancy(record)) return 'no_issue';
  return record.status || 'detected';
}
