import { describe, it, expect, vi } from 'vitest';
import { downloadCSV, formatCurrency, formatPercentage, cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats positive amounts in INR', () => {
      const result = formatCurrency(1500);
      expect(result).toContain('1,500');
    });

    it('formats zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });

    it('formats large amounts', () => {
      const result = formatCurrency(125000);
      expect(result).toContain('1,25,000');
    });
  });

  describe('formatPercentage', () => {
    it('formats with one decimal place', () => {
      expect(formatPercentage(45.678)).toBe('45.7%');
    });

    it('formats zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });
  });

  describe('cn', () => {
    it('merges class names', () => {
      const result = cn('px-4', 'py-2', 'text-sm');
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
    });

    it('handles conditional classes', () => {
      const result = cn('base', false && 'hidden', 'visible');
      expect(result).toContain('base');
      expect(result).toContain('visible');
      expect(result).not.toContain('hidden');
    });
  });

  describe('downloadCSV', () => {
    it('handles empty data gracefully', () => {
      // Should not throw
      expect(() => downloadCSV([], 'test')).not.toThrow();
    });

    it('creates proper CSV with headers', () => {
      const createObjectURL = vi.fn(() => 'blob:test');
      const revokeObjectURL = vi.fn();
      const click = vi.fn();
      
      global.URL.createObjectURL = createObjectURL;
      global.URL.revokeObjectURL = revokeObjectURL;
      
      // Mock createElement
      const mockLink = { href: '', download: '', click };
      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      
      downloadCSV([{ name: 'Test', value: 100 }], 'export');
      
      expect(createObjectURL).toHaveBeenCalled();
      expect(click).toHaveBeenCalled();
      expect(mockLink.download).toContain('export_');
    });
  });
});
