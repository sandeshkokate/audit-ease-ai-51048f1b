import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatCurrency } from '@/lib/utils';
import { FileText, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'>;

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  generated: 'bg-warning/10 text-warning border-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AccountantInvoices() {
  const [selected, setSelected] = useState<any>(null);
  const { user } = useAuth();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['accountant-invoices', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.tenant_id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const columns: Column<any>[] = [
    { key: 'invoice_number', header: <ColumnHeader title="Invoice #" tooltip="Unique invoice reference number" />, sortable: true },
    { key: 'invoice_period_start', header: <ColumnHeader title="Period" tooltip="Billing period covered by this invoice" />, render: (r) => `${r.invoice_period_start} – ${r.invoice_period_end}` },
    { key: 'total_recovered', header: <ColumnHeader title="Recovered" tooltip="Total amount recovered from courier overcharges" />, sortable: true, render: (r) => <span className="font-medium">{formatCurrency(r.total_recovered)}</span> },
    { key: 'commission_amount', header: <ColumnHeader title="Commission" tooltip="Platform fee calculated as percentage of recovered amount" />, render: (r) => formatCurrency(r.commission_amount) },
    { key: 'total_amount', header: <ColumnHeader title="Net Payable" tooltip="Total amount due = Commission + GST" />, render: (r) => <span className="font-semibold">{formatCurrency(r.total_amount)}</span> },
    { key: 'status', header: <ColumnHeader title="Status" tooltip="Paid (payment received), Pending (awaiting payment), Overdue (past due date)" />, render: (r) => <Badge variant="outline" className={STATUS_COLORS[r.status] || STATUS_COLORS.pending}>{r.status}</Badge> },
    { key: 'actions', header: '', render: (r) => <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(r)}><Eye className="h-4 w-4" /></Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        <div><h1 className="text-2xl font-bold text-foreground">Invoices</h1><p className="text-sm text-muted-foreground">View invoice history (read-only)</p></div>
      </div>

      <DataTable columns={columns} data={invoices} pageSize={10} searchable searchKeys={['invoice_number']} searchPlaceholder="Search invoices..." />

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Invoice {selected?.invoice_number}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Period</p><p className="font-medium">{selected.invoice_period_start} – {selected.invoice_period_end}</p></div>
                <div><p className="text-muted-foreground">Status</p><Badge variant="outline" className={STATUS_COLORS[selected.status] || STATUS_COLORS.pending}>{selected.status}</Badge></div>
                <div><p className="text-muted-foreground">Total Recovered</p><p className="font-medium">{formatCurrency(selected.total_recovered)}</p></div>
                <div><p className="text-muted-foreground">Commission ({selected.commission_percentage}%)</p><p className="font-medium">{formatCurrency(selected.commission_amount)}</p></div>
                <div><p className="text-muted-foreground">GST ({selected.gst_percentage ?? 18}%)</p><p className="font-medium">{formatCurrency(selected.gst_amount ?? 0)}</p></div>
                <div><p className="text-muted-foreground">Net Payable</p><p className="font-semibold text-primary">{formatCurrency(selected.total_amount)}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
