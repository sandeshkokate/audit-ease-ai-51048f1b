import { useState, useMemo } from 'react';
import { INVOICE_STATUS_LABELS, getLabel } from '@/lib/display-labels';
import { format, subMonths } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Plus, Loader2, AlertTriangle } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import type { Tables } from '@/integrations/supabase/types';

type Invoice = Tables<'invoices'>;

export default function Invoices() {
  useDocumentTitle('Invoices');
  const { user } = useAuth();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [generateMonth, setGenerateMonth] = useState(() => format(subMonths(new Date(), 1), 'MMMM yyyy'));
  const monthOptions = useMemo(() => Array.from({ length: 12 }, (_, i) => format(subMonths(new Date(), i), 'MMMM yyyy')), []);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const { data: invoices = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['invoices', user?.tenant_id],
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

  const handleDownloadPDF = (invoice: any) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      toast({ variant: 'destructive', title: 'Pop-up blocked', description: 'Please allow pop-ups for this site to download invoices.' });
      return;
    }

    printWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${invoice.invoice_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #111; padding: 40px; max-width: 780px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .logo { font-size: 20px; font-weight: bold; color: #1a1a2e; }
    .logo span { color: #6366f1; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 28px; color: #6366f1; font-weight: 700; }
    .invoice-title p { color: #666; font-size: 14px; margin-top: 4px; }
    .divider { border-top: 2px solid #e5e7eb; margin: 24px 0; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .meta-item label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
    .meta-item p { font-size: 14px; font-weight: 600; color: #111; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    th { background: #f3f4f6; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
    .amount-col { text-align: right; }
    .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #111; border-bottom: none; }
    .footer { margin-top: 40px; text-align: center; color: #888; font-size: 12px; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-pending { background: #fef3c7; color: #92400e; }
    .badge-paid { background: #d1fae5; color: #065f46; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Audit<span>Ease</span> AI</div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <p>${invoice.invoice_number}</p>
    </div>
  </div>
  <div class="divider"></div>
  <div class="meta-grid">
    <div class="meta-item"><label>Billing Period</label><p>${invoice.invoice_period_start} to ${invoice.invoice_period_end}</p></div>
    <div class="meta-item"><label>Status</label><p><span class="badge ${invoice.status === 'paid' ? 'badge-paid' : 'badge-pending'}">${{ generated: 'Generated', pending: 'Pending', paid: 'Paid', overdue: 'Overdue' }[invoice.status] || 'Pending'}</span></p></div>
    <div class="meta-item"><label>Invoice Date</label><p>${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString('en-IN') : '-'}</p></div>
    <div class="meta-item"><label>Due Date</label><p>${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : 'On receipt'}</p></div>
  </div>
  <table>
    <thead><tr><th>Description</th><th class="amount-col">Amount</th></tr></thead>
    <tbody>
      <tr><td>Total Recovered from Couriers</td><td class="amount-col">₹${Number(invoice.total_recovered || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
      <tr><td>Platform Commission (${invoice.commission_percentage}%)</td><td class="amount-col">₹${Number(invoice.commission_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
      <tr><td>GST @ ${invoice.gst_percentage || 18}% on commission</td><td class="amount-col">₹${Number(invoice.gst_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
      <tr class="total-row"><td>Total Amount Payable</td><td class="amount-col">₹${Number(invoice.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
    </tbody>
  </table>
  <div class="footer">
    <p>AuditEase AI — Courier Billing Audit Platform</p>
    <p>This is a computer-generated invoice.</p>
  </div>
</body>
</html>
    `);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><div className="h-7 w-24 rounded bg-muted animate-pulse" /><div className="h-4 w-48 rounded bg-muted animate-pulse mt-2" /></div>
        </div>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="h-5 w-40 rounded bg-muted animate-pulse" />
          <div className="flex gap-3"><div className="h-10 w-48 rounded bg-muted animate-pulse" /><div className="h-10 w-32 rounded bg-muted animate-pulse" /></div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3 border-t border-border">
              {Array.from({ length: 6 }).map((_, j) => (<div key={j} className="h-4 flex-1 rounded bg-muted animate-pulse" />))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Failed to load data</p>
            <p className="text-sm text-muted-foreground">There was an error loading this page.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!generateMonth) { toast({ variant: 'destructive', title: 'Select a month' }); return; }
    setGenerating(true);
    try {
      // Migrated from n8n to Supabase
      const { data, error: rpcError } = await supabase.rpc('generate_monthly_invoice', {
        p_tenant_id: user?.tenant_id,
        p_billing_month: generateMonth,
        p_generated_by: user?.id
      });

      if (rpcError) throw rpcError;
      const result = data as any;
      if (!result.success) throw new Error(result.error || 'Invoice generation failed');

      toast({
        title: '✅ Invoice generated!',
        description: result.invoice_number
          ? `Invoice ${result.invoice_number} — Total: ₹${result.total_amount}`
          : result.message || `Invoice for ${generateMonth} created.`
      });
      setGenerateMonth('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Generation failed', description: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const columns: Column<any>[] = [
    { key: 'invoice_number', header: <ColumnHeader title="Invoice #" tooltip="Unique invoice reference number" />, sortable: true },
    { key: 'invoice_period_start', header: <ColumnHeader title="Period" tooltip="Billing period covered by this invoice" />, sortable: true, render: (r) => `${r.invoice_period_start} – ${r.invoice_period_end}` },
    { key: 'total_recovered', header: <ColumnHeader title="Recovered" tooltip="Sum of all credit notes received from couriers during this period" />, sortable: true, render: (r) => formatCurrency(r.total_recovered) },
    { key: 'commission_amount', header: <ColumnHeader title="Commission" tooltip="AuditEase platform fee — calculated as percentage of recovered amount" />, render: (r) => formatCurrency(r.commission_amount) },
    { key: 'gst_amount', header: <ColumnHeader title="GST" tooltip="GST applicable on commission" />, render: (r) => formatCurrency(r.gst_amount ?? 0) },
    { key: 'total_amount', header: <ColumnHeader title="Net Payable" tooltip="Total amount due = Commission + GST" />, sortable: true, render: (r) => <span className="font-semibold">{formatCurrency(r.total_amount)}</span> },
    { key: 'status', header: <ColumnHeader title="Status" tooltip="Pending (awaiting payment), Paid (payment received)" />, render: (r) => (
      <Badge variant="outline" className={r.status === 'paid' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
        {r.status}
      </Badge>
    )},
    { key: 'actions', header: '', render: (r) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(r)}>View</Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadPDF(r)}><Download className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-foreground">Invoices</h1><p className="text-sm text-muted-foreground">View and manage your AuditEase invoices</p></div>
      </div>

      {/* Generate Invoice */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Generate Monthly Invoice</CardTitle><CardDescription>Select period to generate a new invoice</CardDescription></CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-end gap-3">
          <Select value={generateMonth} onValueChange={setGenerateMonth}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Select month" /></SelectTrigger>
            <SelectContent>
              {monthOptions.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="hero" className="gap-2" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Generate invoice
          </Button>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={invoices} pageSize={10} />

      {/* Invoice Detail Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Invoice {selectedInvoice?.invoice_number}</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Period</p><p className="font-medium">{selectedInvoice.invoice_period_start} – {selectedInvoice.invoice_period_end}</p></div>
                <div><p className="text-muted-foreground text-xs">Line Items</p><p className="font-medium">{Array.isArray(selectedInvoice.line_items) ? selectedInvoice.line_items.length : '-'}</p></div>
                <div><p className="text-muted-foreground text-xs">Status</p><Badge variant="outline" className={selectedInvoice.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>{getLabel(INVOICE_STATUS_LABELS, selectedInvoice.status)}</Badge></div>
                <div><p className="text-muted-foreground text-xs">Created</p><p className="font-medium">{selectedInvoice.created_at ? new Date(selectedInvoice.created_at).toLocaleDateString() : '-'}</p></div>
              </div>
              <Card className="bg-muted/30"><CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Recovered</span><span className="font-medium">{formatCurrency(selectedInvoice.total_recovered)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Commission ({selectedInvoice.commission_percentage}%)</span><span className="font-medium">{formatCurrency(selectedInvoice.commission_amount)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST ({selectedInvoice.gst_percentage ?? 18}%)</span><span className="font-medium">{formatCurrency(selectedInvoice.gst_amount ?? 0)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between"><span className="font-semibold">Net Payable</span><span className="font-bold text-primary">{formatCurrency(selectedInvoice.total_amount)}</span></div>
              </CardContent></Card>
              <div className="flex justify-end">
                <Button variant="outline" className="gap-2" onClick={() => handleDownloadPDF(selectedInvoice)}><Download className="h-4 w-4" /> Download PDF</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
