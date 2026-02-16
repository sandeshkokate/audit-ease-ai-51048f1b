import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DataTable, { Column } from '@/components/shared/DataTable';
import { mockAuditLogs } from '@/lib/tenant-mock-data';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Download, Package, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  detected: 'bg-warning/10 text-warning border-warning/20',
  disputed: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AuditLogs() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const filtered = mockAuditLogs.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (courierFilter !== 'all' && l.courier !== courierFilter) return false;
    if (typeFilter !== 'all' && l.discrepancy_type !== typeFilter) return false;
    return true;
  });

  const stats = {
    total: mockAuditLogs.length,
    detected: mockAuditLogs.filter(l => l.status === 'detected').length,
    disputed: mockAuditLogs.filter(l => l.status === 'disputed').length,
    resolved: mockAuditLogs.filter(l => l.status === 'resolved').length,
    totalAmount: mockAuditLogs.reduce((s, l) => s + l.discrepancy_amount, 0),
  };

  const columns: Column<any>[] = [
    { key: 'awb_number', header: 'AWB', sortable: true },
    { key: 'courier', header: 'Courier', sortable: true },
    { key: 'order_id', header: 'Order ID' },
    { key: 'discrepancy_type', header: 'Type', render: (r) => <Badge variant="outline" className="capitalize">{r.discrepancy_type}</Badge> },
    { key: 'billed_weight', header: 'Billed Wt', sortable: true, render: (r) => `${r.billed_weight} kg` },
    { key: 'actual_weight', header: 'Actual Wt', render: (r) => `${r.actual_weight} kg` },
    { key: 'discrepancy_amount', header: 'Discrepancy', sortable: true, render: (r) => <span className="font-medium text-destructive">₹{r.discrepancy_amount}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <Badge variant="outline" className={STATUS_COLORS[r.status]}>{r.status}</Badge> },
    { key: 'created_at', header: 'Date', render: (r) => <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span> },
    { key: 'actions', header: '', render: (r) => <Button variant="ghost" size="sm" onClick={() => setSelectedLog(r)}>View</Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Audit Logs</h1><p className="text-sm text-muted-foreground">All audited shipments and discrepancies</p></div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(filtered.map(l => ({ AWB: l.awb_number, Courier: l.courier, Type: l.discrepancy_type, Amount: l.discrepancy_amount, Status: l.status })), 'audit_logs')}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Package, color: 'text-foreground' },
          { label: 'Detected', value: stats.detected, icon: AlertTriangle, color: 'text-warning' },
          { label: 'Disputed', value: stats.disputed, icon: Package, color: 'text-primary' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-success' },
          { label: 'Total ₹', value: formatCurrency(stats.totalAmount), icon: Package, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="detected">Detected</SelectItem><SelectItem value="disputed">Disputed</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select>
        <Select value={courierFilter} onValueChange={setCourierFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Couriers</SelectItem>{['Delhivery','BlueDart','DTDC','Ecom Express','Shadowfax'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{['weight','zone','rto','cod','other'].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={20} searchable searchKeys={['awb_number', 'courier', 'order_id']} searchPlaceholder="Search AWB, courier, order..." />

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>AWB: {selectedLog?.awb_number}</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="grid gap-6 sm:grid-cols-2 py-2">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-muted-foreground text-xs">Courier</p><p className="font-medium">{selectedLog.courier}</p></div>
                  <div><p className="text-muted-foreground text-xs">Order ID</p><p className="font-medium">{selectedLog.order_id}</p></div>
                  <div><p className="text-muted-foreground text-xs">Zone (Billed/Actual)</p><p className="font-medium">{selectedLog.billed_zone} → {selectedLog.actual_zone}</p></div>
                  <div><p className="text-muted-foreground text-xs">Type</p><Badge variant="outline" className="capitalize">{selectedLog.discrepancy_type}</Badge></div>
                </div>
                <Card className="bg-muted/30"><CardContent className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Weight Calculation</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Dead Weight:</span> <span className="font-medium">{selectedLog.dead_weight} kg</span></div>
                    <div><span className="text-muted-foreground">Volumetric:</span> <span className="font-medium">{selectedLog.volumetric_weight} kg</span></div>
                    <div><span className="text-muted-foreground">Expected:</span> <span className="font-medium">{selectedLog.actual_weight} kg</span></div>
                    <div><span className="text-muted-foreground">Charged:</span> <span className="font-medium text-destructive">{selectedLog.billed_weight} kg</span></div>
                  </div>
                </CardContent></Card>
                <Card className="bg-muted/30"><CardContent className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Amounts</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Billed:</span> <span className="font-medium">{formatCurrency(selectedLog.billed_amount)}</span></div>
                    <div><span className="text-muted-foreground">Expected:</span> <span className="font-medium">{formatCurrency(selectedLog.expected_amount)}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Discrepancy:</span> <span className="font-bold text-destructive">{formatCurrency(selectedLog.discrepancy_amount)}</span></div>
                  </div>
                </CardContent></Card>
                {selectedLog.dispute_reasoning && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Discrepancy Reasons</p>
                    {selectedLog.dispute_reasoning.issues.map((issue: any, i: number) => (
                      <Card key={i} className="bg-destructive/5 border-destructive/10"><CardContent className="p-3">
                        <p className="text-sm font-medium capitalize">{issue.type} Issue</p>
                        <p className="text-xs text-muted-foreground">{issue.description}</p>
                      </CardContent></Card>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Timeline</p>
                <div className="relative pl-4 border-l-2 border-border space-y-4">
                  {selectedLog.timeline.map((t: any, i: number) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[1.3rem] mt-1 h-3 w-3 rounded-full bg-primary border-2 border-card" />
                      <p className="text-sm font-medium">{t.event}</p>
                      <p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
