import { describe, it, expect } from 'vitest';
import { exportTableToCSV, exportToJSON } from '@/lib/export-utils';

describe('Export Utilities', () => {
  describe('exportTableToCSV', () => {
    it('does not throw with empty data', () => {
      expect(() => exportTableToCSV([], [{ key: 'name', header: 'Name' }], 'test')).not.toThrow();
    });
  });

  describe('exportToJSON', () => {
    it('does not throw with data', () => {
      // We can't easily test file downloads in unit tests, but ensure no errors
      expect(() => {
        // Mock needed globals
        const mockLink = { href: '', download: '', click: () => {} };
        const origCreateElement = document.createElement.bind(document);
        document.createElement = ((tag: string) => {
          if (tag === 'a') return mockLink as any;
          return origCreateElement(tag);
        }) as any;

        const createObjectURL = (blob: any) => 'blob:test';
        const revokeObjectURL = () => {};
        global.URL.createObjectURL = createObjectURL;
        global.URL.revokeObjectURL = revokeObjectURL;

        exportToJSON([{ id: 1, name: 'test' }], 'export');

        document.createElement = origCreateElement;
      }).not.toThrow();
    });
  });
});
