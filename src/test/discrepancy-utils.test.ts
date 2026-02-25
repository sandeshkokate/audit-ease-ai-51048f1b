import { describe, it, expect } from 'vitest';
import {
  estimateSavings,
  classifyDiscrepancy,
  aggregateCourierPerformance,
  summariseDiscrepancyTypes,
  formatINR,
  INDUSTRY_ERROR_RATE,
  AVG_OVERCHARGE_PERCENT,
} from '@/lib/discrepancy-utils';

describe('Discrepancy Calculation Utils', () => {
  // ── estimateSavings ──────────────────────────────────────────────
  describe('estimateSavings', () => {
    it('calculates correctly for default values', () => {
      const result = estimateSavings(5000, 80);
      expect(result.estimatedErrors).toBe(Math.round(5000 * INDUSTRY_ERROR_RATE));
      expect(result.estimatedErrors).toBe(600);
      expect(result.monthlyPotential).toBe(Math.round(600 * 80 * AVG_OVERCHARGE_PERCENT));
      expect(result.monthlyPotential).toBe(7200);
      expect(result.annualPotential).toBe(7200 * 12);
      expect(result.avgOverchargePerError).toBe(12);
    });

    it('returns zero for zero shipments', () => {
      const result = estimateSavings(0, 80);
      expect(result.estimatedErrors).toBe(0);
      expect(result.monthlyPotential).toBe(0);
      expect(result.annualPotential).toBe(0);
    });

    it('scales linearly with shipments', () => {
      const a = estimateSavings(1000, 100);
      const b = estimateSavings(2000, 100);
      expect(b.monthlyPotential).toBe(a.monthlyPotential * 2);
    });

    it('handles large volumes', () => {
      const result = estimateSavings(50000, 200);
      expect(result.estimatedErrors).toBe(6000);
      expect(result.annualPotential).toBeGreaterThan(0);
    });
  });

  // ── classifyDiscrepancy ──────────────────────────────────────────
  describe('classifyDiscrepancy', () => {
    it('returns Weight when has_weight_discrepancy is true', () => {
      expect(classifyDiscrepancy({ has_weight_discrepancy: true })).toBe('Weight');
    });

    it('returns Zone when has_zone_discrepancy is true', () => {
      expect(classifyDiscrepancy({ has_zone_discrepancy: true })).toBe('Zone');
    });

    it('returns RTO when has_rto_overcharge is true', () => {
      expect(classifyDiscrepancy({ has_rto_overcharge: true })).toBe('RTO');
    });

    it('returns Damage when has_damage_misclassification is true', () => {
      expect(classifyDiscrepancy({ has_damage_misclassification: true })).toBe('Damage');
    });

    it('returns Unclassified when no flags are set', () => {
      expect(classifyDiscrepancy({})).toBe('Unclassified');
    });

    it('prioritises Weight over Zone (first-match wins)', () => {
      expect(classifyDiscrepancy({
        has_weight_discrepancy: true,
        has_zone_discrepancy: true,
      })).toBe('Weight');
    });

    it('handles null flags as false', () => {
      expect(classifyDiscrepancy({
        has_weight_discrepancy: null,
        has_zone_discrepancy: null,
      })).toBe('Unclassified');
    });
  });

  // ── aggregateCourierPerformance ──────────────────────────────────
  describe('aggregateCourierPerformance', () => {
    const sampleLogs = [
      { courier_name: 'Delhivery', discrepancy_amount: 100, has_weight_discrepancy: true, has_zone_discrepancy: false, has_rto_overcharge: false },
      { courier_name: 'Delhivery', discrepancy_amount: 0, has_weight_discrepancy: false, has_zone_discrepancy: false, has_rto_overcharge: false },
      { courier_name: 'BlueDart', discrepancy_amount: 200, has_weight_discrepancy: false, has_zone_discrepancy: true, has_rto_overcharge: false },
    ];

    it('groups logs by courier', () => {
      const result = aggregateCourierPerformance(sampleLogs);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.courier).sort()).toEqual(['BlueDart', 'Delhivery']);
    });

    it('counts shipments and discrepancies correctly', () => {
      const result = aggregateCourierPerformance(sampleLogs);
      const delhivery = result.find((r) => r.courier === 'Delhivery')!;
      expect(delhivery.shipments).toBe(2);
      expect(delhivery.discrepancies).toBe(1);
    });

    it('calculates discrepancy_rate as percentage', () => {
      const result = aggregateCourierPerformance(sampleLogs);
      const delhivery = result.find((r) => r.courier === 'Delhivery')!;
      expect(delhivery.discrepancy_rate).toBe(50.0);
    });

    it('calculates avg_overcharge correctly', () => {
      const result = aggregateCourierPerformance(sampleLogs);
      const bluedart = result.find((r) => r.courier === 'BlueDart')!;
      expect(bluedart.avg_overcharge).toBe(200);
    });

    it('returns empty array for empty input', () => {
      expect(aggregateCourierPerformance([])).toEqual([]);
    });

    it('labels null courier_name as Unknown', () => {
      const result = aggregateCourierPerformance([
        { courier_name: null, discrepancy_amount: 50, has_weight_discrepancy: true },
      ]);
      expect(result[0].courier).toBe('Unknown');
    });
  });

  // ── summariseDiscrepancyTypes ────────────────────────────────────
  describe('summariseDiscrepancyTypes', () => {
    it('tallies each discrepancy type', () => {
      const logs = [
        { courier_name: 'X', discrepancy_amount: 100, has_weight_discrepancy: true },
        { courier_name: 'X', discrepancy_amount: 200, has_zone_discrepancy: true },
        { courier_name: 'X', discrepancy_amount: 150, has_rto_overcharge: true },
        { courier_name: 'X', discrepancy_amount: 50, has_damage_misclassification: true },
      ];
      const result = summariseDiscrepancyTypes(logs);
      expect(result.find((r) => r.name === 'Weight')).toEqual({ name: 'Weight', count: 1, amount: 100 });
      expect(result.find((r) => r.name === 'Zone')).toEqual({ name: 'Zone', count: 1, amount: 200 });
      expect(result.find((r) => r.name === 'RTO')).toEqual({ name: 'RTO', count: 1, amount: 150 });
      expect(result.find((r) => r.name === 'Damage')).toEqual({ name: 'Damage', count: 1, amount: 50 });
    });

    it('returns zeros when no flags set', () => {
      const logs = [{ courier_name: 'X', discrepancy_amount: 100 }];
      const result = summariseDiscrepancyTypes(logs);
      result.forEach((r) => {
        expect(r.count).toBe(0);
        expect(r.amount).toBe(0);
      });
    });

    it('handles null discrepancy_amount as 0', () => {
      const logs = [{ courier_name: 'X', discrepancy_amount: null, has_weight_discrepancy: true }];
      const result = summariseDiscrepancyTypes(logs);
      expect(result.find((r) => r.name === 'Weight')).toEqual({ name: 'Weight', count: 1, amount: 0 });
    });
  });

  // ── formatINR ────────────────────────────────────────────────────
  describe('formatINR', () => {
    it('formats amounts under 1L with comma separator', () => {
      expect(formatINR(50000)).toBe('₹50,000');
    });

    it('formats amounts >= 1L in lakhs', () => {
      expect(formatINR(100000)).toBe('₹1.0L');
      expect(formatINR(250000)).toBe('₹2.5L');
    });

    it('formats zero', () => {
      expect(formatINR(0)).toBe('₹0');
    });
  });
});
