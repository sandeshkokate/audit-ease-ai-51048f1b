import { useState } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { Download, Package, AlertTriangle, CheckCircle2, XCircle, Loader2, Weight, MapPin, RotateCcw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  detected: 'bg-warning/10 text-warning border-warning/20',
  disputed: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function AuditLogs() {
  useDocumentTitle('Audit Logs');
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['audit-logs', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.tenant_id
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const filtered = auditLogs.filter(l => {
    if (statusFilter !== 'all' && l.dispute_status !== statusFilter) return false;
    if (courierFilter !== 'all' && l.courier_name !== courierFilter) return false;
    if (typeFilter !== 'all') {
      const type = l.has_weight_discrepancy ? 'weight' : l.has_zone_discrepancy ? 'zone' : l.has_rto_overcharge ? 'rto' : 'other';
      if (type !== typeFilter) return false;
    }
    return true;
  });

  const stats = {
    total: auditLogs.length,
    detected: auditLogs.filter(l => l.dispute_status === 'detected').length,
    disputed: auditLogs.filter(l => l.dispute_status === 'disputed').length,
    resolved: auditLogs.filter(l => l.dispute_status === 'resolved').length,
    totalAmount: auditLogs.reduce((s, l) => s + (l.discrepancy_amount || 0), 0),
  };

  const columns: Column<any>[] = [
    { key: 'awb', header: <ColumnHeader title="AWB" tooltip="Air Waybill Number — unique shipment tracking ID assigned by the courier partner" />, sortable: true },
    { key: 'courier_name', header: <ColumnHeader title="Courier" tooltip="The logistics company that handled this shipment (e.g., Delhivery, Blue Dart)" />, sortable: true },
    { key: 'order_id', header: <ColumnHeader title="Order ID" tooltip="Your internal order reference number from your e-commerce platform" /> },
    { key: 'type', header: <ColumnHeader title="Type" tooltip="Category of billing error: Weight (incorrect weight charged), Zone (wrong delivery zone), RTO (return shipment overcharge)" />, render: (r) => { const t = r.has_weight_discrepancy ? 'weight' : r.has_zone_discrepancy ? 'zone' : r.has_rto_overcharge ? 'rto' : 'other'; return <Badge variant="outline" className="capitalize">{t}</Badge>; } },
    { key: 'charged_weight', header: <ColumnHeader title="Billed Wt" tooltip="Weight charged by courier (kg)." />, sortable: true, render: (r) => `${r.charged_weight ?? '-'} kg` },
    { key: 'max_expected_weight', header: <ColumnHeader title="Actual Wt" tooltip="Expected chargeable weight" />, render: (r) => `${r.max_expected_weight ?? '-'} kg` },
    { key: 'discrepancy_amount', header: <ColumnHeader title="Discrepancy" tooltip="Amount overcharged" />, sortable: true, render: (r) => <span className="font-medium text-destructive">₹{r.discrepancy_amount ?? 0}</span> },
    { key: 'dispute_status', header: <ColumnHeader title="Status" tooltip="Detected, Disputed, Resolved, Rejected" />, sortable: true, render: (r) => <Badge variant="outline" className={STATUS_COLORS[r.dispute_status] || ''}>{r.dispute_status}</Badge> },
    { key: 'created_at', header: <ColumnHeader title="Date" tooltip="When this shipment record was uploaded and processed" />, render: (r) => <span className="text-sm text-muted-foreground">{r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : '-'}</span> },
    { key: 'actions', header: '', render: (r) => <Button variant="ghost" size="sm" onClick={() => setSelectedLog(r)}>View</Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Audit Logs</h1><p className="text-sm text-muted-foreground">All audited shipments and discrepancies</p></div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(filtered.map(l => ({
          AWB: l.awb,
          Courier: l.courier_name,
          Order_ID: l.order_id,
          Discrepancy_Type: l.has_weight_discrepancy ? 'Weight' : l.has_zone_discrepancy ? 'Zone' : l.has_rto_overcharge ? 'RTO' : 'Other',
          Charged_Weight: l.charged_weight,
          Expected_Weight: l.max_expected_weight,
          Charged_Zone: l.charged_zone,
          Expected_Zone: l.expected_zone,
          Billed_Amount: l.billed_amount,
          Expected_Amount: l.expected_amount,
          Discrepancy_Amount: l.discrepancy_amount,
          Dispute_Status: l.dispute_status,
          Recovery_Amount: l.recovery_amount || 0,
          Shipment_Status: l.shipment_status,
          Created_At: l.created_at ? new Date(l.created_at).toLocaleDateString() : '',
        })), 'audit_logs')}>
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
        <Select value={courierFilter} onValueChange={setCourierFilter}><SelectTrigger className="w-40"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Couriers</SelectItem>{[...new Set(auditLogs.map((l: any) => l.courier_name).filter(Boolean))].sort().map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem>{['weight','zone','rto','cod','other'].map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent></Select>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={20} searchable searchKeys={['awb', 'courier_name', 'order_id']} searchPlaceholder="Search AWB, courier, order..." />

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Shipment Details</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="space-y-4 py-2">
              {/* Shipment Summary */}
              <Card className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shipment Summary</p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <span className="text-lg font-bold text-foreground">{selectedLog.awb || '-'}</span>
                    <span className="text-sm text-muted-foreground">{selectedLog.courier_name}</span>
                    <span className="text-sm text-muted-foreground">Order: {selectedLog.order_id}</span>
                    <Badge variant="outline" className={STATUS_COLORS[selectedLog.dispute_status] || ''}>{selectedLog.dispute_status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    <span>Shipment: <span className="text-foreground font-medium">{selectedLog.shipment_status ?? '-'}</span></span>
                    <span>Created: <span className="text-foreground font-medium">{selectedLog.created_at ? format(new Date(selectedLog.created_at), 'dd MMM yyyy') : '-'}</span></span>
                  </div>
                </CardContent>
              </Card>

              {/* Discrepancy Analysis */}
              <Card className="shadow-card">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Discrepancy Analysis</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Billed (Courier charged)</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-medium">{selectedLog.charged_weight ?? '-'} kg</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Zone</span><span className="font-medium">{selectedLog.charged_zone ?? '-'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">{formatCurrency(selectedLog.billed_amount ?? 0)}</span></div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Expected (Your rate card)</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Weight</span><span className="font-medium">{selectedLog.max_expected_weight ?? '-'} kg</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Zone</span><span className="font-medium">{selectedLog.expected_zone ?? '-'}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">{formatCurrency(selectedLog.expected_amount ?? 0)}</span></div>
                      </div>
                    </div>
                  </div>
                  {(selectedLog.discrepancy_amount ?? 0) > 0 && (
                    <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-center">
                      <span className="text-sm text-destructive">Overcharge: </span>
                      <span className="text-xl font-bold text-destructive">{formatCurrency(selectedLog.discrepancy_amount)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Weight Details */}
              <Card className="shadow-card">
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Weight Details</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div><p className="text-muted-foreground text-xs">Dead Weight</p><p className="font-medium">{selectedLog.dead_weight ?? '-'} kg</p></div>
                    <div><p className="text-muted-foreground text-xs">Volumetric</p><p className="font-medium">{selectedLog.volumetric_weight ?? '-'} kg</p></div>
                    <div><p className="text-muted-foreground text-xs">Max Expected</p><p className="font-medium">{selectedLog.max_expected_weight ?? '-'} kg</p></div>
                    <div>
                      <p className="text-muted-foreground text-xs">Charged</p>
                      <p className={`font-medium ${selectedLog.charged_weight && selectedLog.max_expected_weight && selectedLog.charged_weight > selectedLog.max_expected_weight ? 'text-destructive' : ''}`}>
                        {selectedLog.charged_weight ?? '-'} kg
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Discrepancy Reasons */}
              {selectedLog.discrepancy_reasons && Array.isArray(selectedLog.discrepancy_reasons) && selectedLog.discrepancy_reasons.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Discrepancy Reasons</p>
                  {selectedLog.discrepancy_reasons.map((issue: any, i: number) => {
                    const Icon = issue.type === 'weight' ? Weight : issue.type === 'zone' ? MapPin : RotateCcw;
                    return (
                      <Card key={i} className="border-destructive/10 bg-destructive/5">
                        <CardContent className="p-3 flex items-start gap-3">
                          <Icon className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium capitalize">{issue.type} Discrepancy</p>
                            <p className="text-xs text-muted-foreground">{issue.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Recovery Status */}
              {selectedLog.dispute_status !== 'no_issue' && (
                <Card className="shadow-card">
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recovery Status</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div><p className="text-muted-foreground text-xs">Status</p><Badge variant="outline" className={STATUS_COLORS[selectedLog.dispute_status] || ''}>{selectedLog.dispute_status}</Badge></div>
                      <div><p className="text-muted-foreground text-xs">Dispute Raised</p><p className="font-medium">{selectedLog.dispute_raised_date ? format(new Date(selectedLog.dispute_raised_date), 'dd MMM yyyy') : '-'}</p></div>
                      <div><p className="text-muted-foreground text-xs">Recovery Date</p><p className="font-medium">{selectedLog.recovery_date ? format(new Date(selectedLog.recovery_date), 'dd MMM yyyy') : '-'}</p></div>
                      <div><p className="text-muted-foreground text-xs">Recovery Amount</p><p className="font-medium text-success">{selectedLog.recovery_amount ? formatCurrency(selectedLog.recovery_amount) : '-'}</p></div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
