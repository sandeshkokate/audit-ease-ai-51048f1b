import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { mockInvoices } from '@/lib/tenant-mock-data';
import { formatCurrency } from '@/lib/utils';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AccountantInvoices() {
  const [selected, setSelected] = useState<any>(null);

  const columns: Column<any>[] = [
    { key: 'invoice_number', header: <ColumnHeader title="Invoice #" tooltip="Unique invoice reference number" />, sortable: true },
    { key: 'period', header: <ColumnHeader title="Period" tooltip="Billing period covered by this invoice" /> },
    { key: 'total_recovered', header: <ColumnHeader title="Recovered" tooltip="Total amount recovered from courier overcharges" />, sortable: true, render: (r) => <span className="font-medium">{formatCurrency(r.total_recovered)}</span> },
    { key: 'commission', header: <ColumnHeader title="Commission" tooltip="Platform fee calculated as percentage of recovered amount" />, render: (r) => formatCurrency(r.commission) },
    { key: 'net_payable', header: <ColumnHeader title="Net Payable" tooltip="Total amount due = Commission + GST" />, render: (r) => <span className="font-semibold">{formatCurrency(r.net_payable)}</span> },
    { key: 'status', header: <ColumnHeader title="Status" tooltip="Paid (payment received), Pending (awaiting payment), Overdue (past due date)" />, render: (r) => <Badge variant="outline" className={STATUS_COLORS[r.status]}>{r.status}</Badge> },
    { key: 'actions', header: '', render: (r) => <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(r)}><Eye className="h-4 w-4" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <div><h1 className="text-2xl font-bold text-foreground">Invoices</h1><p className="text-sm text-muted-foreground">View invoice history (read-only)</p></div>
      </div>

      <DataTable columns={columns} data={mockInvoices} pageSize={10} searchable searchKeys={['invoice_number', 'period']} searchPlaceholder="Search invoices..." />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Invoice {selected?.invoice_number}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Period</p><p className="font-medium">{selected.period}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge variant="outline" className={STATUS_COLORS[selected.status]}>{selected.status}</Badge></div>
                <div><p className="text-muted-foreground">Total Recovered</p><p className="font-medium">{formatCurrency(selected.total_recovered)}</p></div>
                <div><p className="text-muted-foreground">Commission (12%)</p><p className="font-medium">{formatCurrency(selected.commission)}</p></div>
                <div><p className="text-muted-foreground">GST (18%)</p><p className="font-medium">{formatCurrency(selected.gst)}</p></div>
                <div><p className="text-muted-foreground">Net Payable</p><p className="font-semibold text-primary">{formatCurrency(selected.net_payable)}</p></div>
              </div>
              <div className="text-xs text-muted-foreground">Line items: {selected.line_items}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
