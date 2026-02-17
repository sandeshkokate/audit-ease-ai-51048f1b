import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { mockInvoices } from '@/lib/tenant-mock-data';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FileText, Download, Plus, Loader2 } from 'lucide-react';

export default function Invoices() {
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [generateMonth, setGenerateMonth] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!generateMonth) { toast({ variant: 'destructive', title: 'Select a month' }); return; }
    setGenerating(true);
    await new Promise(r => setTimeout(r, 2500));
    toast({ title: 'Invoice generated!', description: `Invoice for ${generateMonth} created.` });
    setGenerating(false);
  };

  const columns: Column<any>[] = [
    { key: 'invoice_number', header: <ColumnHeader title="Invoice #" tooltip="Unique invoice reference number" />, sortable: true },
    { key: 'period', header: <ColumnHeader title="Period" tooltip="Billing period covered by this invoice" />, sortable: true },
    { key: 'total_recovered', header: <ColumnHeader title="Recovered" tooltip="Sum of all credit notes received from couriers during this period" />, sortable: true, render: (r) => formatCurrency(r.total_recovered) },
    { key: 'commission', header: <ColumnHeader title="Commission" tooltip="AuditEase platform fee — calculated as percentage of recovered amount" />, render: (r) => formatCurrency(r.commission) },
    { key: 'gst', header: <ColumnHeader title="GST" tooltip="18% Goods and Services Tax applicable on commission" />, render: (r) => formatCurrency(r.gst) },
    { key: 'net_payable', header: <ColumnHeader title="Net Payable" tooltip="Total amount due = Commission + GST" />, sortable: true, render: (r) => <span className="font-semibold">{formatCurrency(r.net_payable)}</span> },
    { key: 'status', header: <ColumnHeader title="Status" tooltip="Pending (awaiting payment), Paid (payment received)" />, render: (r) => (
      <Badge variant="outline" className={r.status === 'paid' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}>
        {r.status}
      </Badge>
    )},
    { key: 'actions', header: '', render: (r) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(r)}>View</Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: 'PDF downloaded' })}><Download className="h-4 w-4" /></Button>
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
              {['January 2026', 'February 2026', 'March 2026', 'December 2025', 'November 2025'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="hero" className="gap-2" onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Generate Invoice
          </Button>
        </CardContent>
      </Card>

      <DataTable columns={columns} data={mockInvoices} pageSize={10} />

      {/* Invoice Detail Modal */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Invoice {selectedInvoice?.invoice_number}</DialogTitle></DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">Period</p><p className="font-medium">{selectedInvoice.period}</p></div>
                <div><p className="text-muted-foreground text-xs">Line Items</p><p className="font-medium">{selectedInvoice.line_items}</p></div>
                <div><p className="text-muted-foreground text-xs">Status</p><Badge variant="outline" className={selectedInvoice.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>{selectedInvoice.status}</Badge></div>
                <div><p className="text-muted-foreground text-xs">Created</p><p className="font-medium">{selectedInvoice.created_at}</p></div>
              </div>
              <Card className="bg-muted/30"><CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Recovered</span><span className="font-medium">{formatCurrency(selectedInvoice.total_recovered)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Commission (12%)</span><span className="font-medium">{formatCurrency(selectedInvoice.commission)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">GST (18%)</span><span className="font-medium">{formatCurrency(selectedInvoice.gst)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between"><span className="font-semibold">Net Payable</span><span className="font-bold text-primary">{formatCurrency(selectedInvoice.net_payable)}</span></div>
              </CardContent></Card>
              <div className="flex justify-end">
                <Button variant="outline" className="gap-2" onClick={() => toast({ title: 'PDF downloaded' })}><Download className="h-4 w-4" /> Download PDF</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
