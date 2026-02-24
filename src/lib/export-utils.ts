import { downloadCSV } from './utils';

/**
 * Export data table to CSV with proper formatting
 */
export function exportTableToCSV<T extends Record<string, any>>(
  data: T[],
  columns: { key: string; header: string }[],
  filename: string
) {
  if (!data.length) return;
  const rows = data.map(row => {
    const mapped: Record<string, any> = {};
    columns.forEach(col => {
      mapped[col.header] = row[col.key] ?? '';
    });
    return mapped;
  });
  downloadCSV(rows, filename);
}

/**
 * Export data to JSON file
 */
export function exportToJSON(data: any[], filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Generate a printable HTML report and trigger print dialog
 */
export function exportToPrint(title: string, html: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 24px; color: #1a1a2e; }
        h1 { font-size: 20px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { padding: 8px 12px; border: 1px solid #e2e8f0; text-align: left; font-size: 13px; }
        th { background: #f1f5f9; font-weight: 600; }
        .meta { color: #64748b; font-size: 12px; margin-bottom: 20px; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      ${html}
      <script>window.print(); window.close();</script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
