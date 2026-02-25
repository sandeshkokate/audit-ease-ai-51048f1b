/**
 * Pure discrepancy-calculation helpers.
 * Extracted so they can be unit-tested without DOM or Supabase dependencies.
 */

// ── Landing calculator ──────────────────────────────────────────────
export const INDUSTRY_ERROR_RATE = 0.12;
export const AVG_OVERCHARGE_PERCENT = 0.15;

export interface SavingsEstimate {
  estimatedErrors: number;
  monthlyPotential: number;
  annualPotential: number;
  avgOverchargePerError: number;
}

export function estimateSavings(
  monthlyShipments: number,
  avgShippingCost: number,
): SavingsEstimate {
  const estimatedErrors = Math.round(monthlyShipments * INDUSTRY_ERROR_RATE);
  const monthlyPotential = Math.round(estimatedErrors * avgShippingCost * AVG_OVERCHARGE_PERCENT);
  return {
    estimatedErrors,
    monthlyPotential,
    annualPotential: monthlyPotential * 12,
    avgOverchargePerError: Math.round(avgShippingCost * AVG_OVERCHARGE_PERCENT),
  };
}

// ── Discrepancy type classification ─────────────────────────────────
export interface AuditLogFlags {
  has_weight_discrepancy?: boolean | null;
  has_zone_discrepancy?: boolean | null;
  has_rto_overcharge?: boolean | null;
  has_damage_misclassification?: boolean | null;
}

export function classifyDiscrepancy(log: AuditLogFlags): string {
  if (log.has_weight_discrepancy) return 'Weight';
  if (log.has_zone_discrepancy) return 'Zone';
  if (log.has_rto_overcharge) return 'RTO';
  if (log.has_damage_misclassification) return 'Damage';
  return 'Unclassified';
}

// ── Courier performance aggregation ─────────────────────────────────
export interface AuditLogRecord extends AuditLogFlags {
  courier_name: string | null;
  discrepancy_amount?: number | null;
  recovery_amount?: number | null;
}

export interface CourierPerformance {
  courier: string;
  shipments: number;
  discrepancies: number;
  total_overcharge: number;
  weight_errors: number;
  zone_errors: number;
  rto_errors: number;
  discrepancy_rate: number;
  avg_overcharge: number;
}

export function aggregateCourierPerformance(logs: AuditLogRecord[]): CourierPerformance[] {
  const grouped: Record<string, Omit<CourierPerformance, 'discrepancy_rate' | 'avg_overcharge'>> = {};

  logs.forEach((log) => {
    const c = log.courier_name || 'Unknown';
    if (!grouped[c]) {
      grouped[c] = { courier: c, shipments: 0, discrepancies: 0, total_overcharge: 0, weight_errors: 0, zone_errors: 0, rto_errors: 0 };
    }
    grouped[c].shipments += 1;
    if ((log.discrepancy_amount ?? 0) > 0) grouped[c].discrepancies += 1;
    grouped[c].total_overcharge += log.discrepancy_amount ?? 0;
    if (log.has_weight_discrepancy) grouped[c].weight_errors++;
    if (log.has_zone_discrepancy) grouped[c].zone_errors++;
    if (log.has_rto_overcharge) grouped[c].rto_errors++;
  });

  return Object.values(grouped).map((g) => ({
    ...g,
    discrepancy_rate: g.shipments ? +((g.discrepancies / g.shipments) * 100).toFixed(1) : 0,
    avg_overcharge: g.discrepancies ? Math.round(g.total_overcharge / g.discrepancies) : 0,
  }));
}

// ── Discrepancy type summary ────────────────────────────────────────
export interface DiscrepancyTypeSummary {
  name: string;
  count: number;
  amount: number;
}

export function summariseDiscrepancyTypes(logs: AuditLogRecord[]): DiscrepancyTypeSummary[] {
  const map: Record<string, DiscrepancyTypeSummary> = {
    Weight: { name: 'Weight', count: 0, amount: 0 },
    Zone: { name: 'Zone', count: 0, amount: 0 },
    RTO: { name: 'RTO', count: 0, amount: 0 },
    Damage: { name: 'Damage', count: 0, amount: 0 },
  };

  logs.forEach((log) => {
    const amt = log.discrepancy_amount ?? 0;
    if (log.has_weight_discrepancy) { map.Weight.count++; map.Weight.amount += amt; }
    else if (log.has_zone_discrepancy) { map.Zone.count++; map.Zone.amount += amt; }
    else if (log.has_rto_overcharge) { map.RTO.count++; map.RTO.amount += amt; }
    else if (log.has_damage_misclassification) { map.Damage.count++; map.Damage.amount += amt; }
  });

  return Object.values(map);
}

// ── Currency formatter (INR) ────────────────────────────────────────
export function formatINR(amount: number): string {
  return amount >= 100000
    ? `₹${(amount / 100000).toFixed(1)}L`
    : `₹${amount.toLocaleString('en-IN')}`;
}
