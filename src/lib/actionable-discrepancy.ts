export interface ActionableDiscrepancyRecord {
  discrepancy_amount?: number | null;
  dispute_status?: string | null;
  has_weight_discrepancy?: boolean | null;
  has_zone_discrepancy?: boolean | null;
  has_rto_overcharge?: boolean | null;
  has_damage_misclassification?: boolean | null;
}

export function hasActionableDiscrepancy(record: Pick<ActionableDiscrepancyRecord, 'discrepancy_amount'>): boolean {
  return (record.discrepancy_amount ?? 0) > 0;
}

export function getActionableDiscrepancyType(record: ActionableDiscrepancyRecord): 'weight' | 'zone' | 'rto' | 'damage' | 'unclassified' | 'no_issue' {
  if (!hasActionableDiscrepancy(record)) return 'no_issue';
  if (record.has_weight_discrepancy) return 'weight';
  if (record.has_zone_discrepancy) return 'zone';
  if (record.has_rto_overcharge) return 'rto';
  if (record.has_damage_misclassification) return 'damage';
  return 'unclassified';
}

export function getActionableDiscrepancyStatus(record: ActionableDiscrepancyRecord): string {
  if (!hasActionableDiscrepancy(record)) return 'no_issue';
  return record.dispute_status || 'detected';
}