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
import { Input } from '@/components/ui/input';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { format } from 'date-fns';
import { Download, Package, AlertTriangle, CheckCircle2, XCircle, Loader2, Weight, MapPin, RotateCcw, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  no_issue: 'bg-success/10 text-success border-success/20',
  detected: 'bg-warning/10 text-warning border-warning/20',
  draft: 'bg-muted text-muted-foreground border-border',
  disputed: 'bg-primary/10 text-primary border-primary/20',
  raised: 'bg-primary/10 text-primary border-primary/20',
  email_copied: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-success/10 text-success border-success/20',
  recovered: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

const STATUS_LABELS: Record<string, string> = {
  no_issue: 'No Issue',
  detected: 'Detected',
  draft: 'Draft',
  disputed: 'Disputed',
  raised: 'Raised',
  email_copied: 'Email Copied',
  resolved: 'Resolved',
  recovered: 'Recovered',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const TYPE_LABELS: Record<string, string> = {
  weight: 'Weight',
  zone: 'Zone',
  rto: 'RTO',
  damage: 'Damage',
  unclassified: 'Unclassified',
  no_issue: 'No Issue',
};

const STATUS_DEFINITIONS = `Status Definitions:
- No Issue — Shipment checked, no billing error found
- Detected — Billing discrepancy found, not yet actioned
- Draft — Dispute email generated, not yet sent
- Email Copied — Dispute email copied, ready to send
- Raised — Dispute email sent to courier
- Recovered — Courier issued credit note, amount recovered
- Rejected — Courier rejected the dispute claim
- Cancelled — Dispute withdrawn

Trigger Points:
- No Issue / Detected: Set automatically on CSV upload and processing
- Draft: Set when n8n generates a dispute email
- Email Copied: Set when user clicks Copy Email in Disputes
- Raised: Set when user clicks Mark as Sent in Disputes
- Recovered: Set manually in Disputes → Mark as Recovered
- Rejected: Set manually in Disputes → Mark as Rejected`;

const TYPE_DEFINITIONS = `Discrepancy Type Definitions:
- Weight — Courier charged more than the actual/volumetric weight
- Zone — Courier applied a higher delivery zone than the correct pincode zone
- RTO — Return-to-origin charges applied incorrectly or at wrong rate
- Damage — Shipment classified as damaged to inflate charges
- Unclassified — Billing difference detected but type not yet categorised
- No Issue — No billing error found for this shipment`;

export default function AuditLogs() {
  useDocumentTitle('Audit Logs');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showStatusDefs, setShowStatusDefs] = useState(false);
  const [showTypeDefs, setShowTypeDefs] = useState(false);

  const { data: auditLogs = [], isLoading, isError, refetch } = useQuery({
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
        <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  const getType = (r: any) => {
    if ((r.discrepancy_amount ?? 0) === 0) return 'no_issue';
    if (r.has_weight_discrepancy) return 'weight';
    if (r.has_zone_discrepancy) return 'zone';
    if (r.has_rto_overcharge) return 'rto';
    if (r.has_damage_misclassification) return 'damage';
    return 'unclassified';
  };

  const getStatus = (r: any) => {
    if ((r.discrepancy_amount ?? 0) === 0) return 'no_issue';
    return r.dispute_status || 'detected';
  };

  const filtered = auditLogs.filter(l => {
    const type = getType(l);
    const status = getStatus(l);
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    if (courierFilter !== 'all' && l.courier_name !== courierFilter) return false;
    if (typeFilter !== 'all' && type !== typeFilter) return false;
    if (dateFrom && l.created_at && new Date(l.created_at) < new Date(dateFrom)) return false;
    if (dateTo && l.created_at && new Date(l.created_at) > new Date(dateTo + 'T23:59:59')) return false;
    return true;
  });

  const stats = {
    total: auditLogs.length,
    detected: auditLogs.filter(l => (l.discrepancy_amount ?? 0) > 0 && (!l.dispute_status || l.dispute_status === 'detected')).length,
    disputed: auditLogs.filter(l => ['raised', 'disputed', 'email_copied', 'draft'].includes(l.dispute_status)).length,
    resolved: auditLogs.filter(l => l.dispute_status === 'recovered').length,
    totalAmount: auditLogs.reduce((s, l) => s + (l.discrepancy_amount || 0), 0),
  };

  const columns: Column<any>[] = [
    { key: 'awb', header: <ColumnHeader title="AWB" tooltip="Air Waybill Number — unique shipment tracking ID assigned by the courier partner" />, sortable: true },
    { key: 'courier_name', header: <ColumnHeader title="Courier" tooltip="The logistics company that handled this shipment (e.g., Delhivery, Blue Dart)" />, sortable: true },
    { key: 'order_id', header: <ColumnHeader title="Order ID" tooltip="Your internal order reference number from your e-commerce platform" /> },
    {
      key: 'type',
      header: <ColumnHeader title="Type" tooltip="Category of billing error: Weight, Zone, RTO, Damage, or Unclassified" />,
      render: (r) => {
        const t = getType(r);
        return <Badge variant="outline">{TYPE_LABELS[t]}</Badge>;
      }
    },
    { key: 'charged_weight', header: <ColumnHeader title="Billed Wt" tooltip="Weight charged by courier (kg)." />, sortable: true, render: (r) => `${r.charged_weight ?? '—'} kg` },
    { key: 'max_expected_weight', header: <ColumnHeader title="Actual Wt" tooltip="Expected chargeable weight" />, render: (r) => `${r.max_expected_weight ?? '—'} kg` },
    { key: 'discrepancy_amount', header: <ColumnHeader title="Discrepancy" tooltip="Amount overcharged" />, sortable: true, render: (r) => (r.discrepancy_amount ?? 0) > 0 ? <span className="font-medium text-destructive">₹{r.discrepancy_amount}</span> : <span className="text-muted-foreground">—</span> },
    {
      key: 'dispute_status',
      header: <ColumnHeader title="Status" tooltip="Current dispute lifecycle stage" />,
      sortable: true,
      render: (r) => {
        const s = getStatus(r);
        return <Badge variant="outline" className={STATUS_COLORS[s] || ''}>{STATUS_LABELS[s] || s}</Badge>;
      }
    },
    {
      key: 'created_at',
      header: <ColumnHeader title="Date" tooltip="When this shipment record was uploaded and processed" />,
      render: (r) => <span className="text-sm text-muted-foreground">{r.created_at ? format(new Date(r.created_at), 'dd MMM yyyy') : '—'}</span>
    },
    { key: 'actions', header: '', render: (r) => <Button variant="ghost" size="sm" onClick={() => setSelectedLog(r)}>View</Button> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground">All audited shipments and discrepancies</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(filtered.map(l => ({
          AWB: l.awb, Courier: l.courier_name, Order_ID: l.order_id,
          Type: TYPE_LABELS[getType(l)], Charged_Weight: l.charged_weight,
          Expected_Weight: l.max_expected_weight, Discrepancy_Amount: l.discrepancy_amount,
          Status: STATUS_LABELS[getStatus(l)], Date: l.created_at ? format(new Date(l.created_at), 'dd MMM yyyy') : '',
        })), 'audit_logs')}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Package, color: 'text-foreground', tab: 'audit' },
          { label: 'Detected', value: stats.detected, icon: AlertTriangle, color: 'text-warning', tab: 'discrepancy' },
          { label: 'Disputed', value: stats.disputed, icon: Package, color: 'text-primary', tab: 'recovery' },
          { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-success', tab: 'recovery' },
          { label: 'Total ₹', value: formatCurrency(stats.totalAmount), icon: Package, color: 'text-destructive', tab: 'financial' },
        ].map(s => (
          <Card key={s.label} className="shadow-card cursor-pointer hover:border-primary/30 transition-colors" onClick={() => navigate(`/tenant-admin/reports?tab=${s.tab}`)}>
            <CardContent className="p-3 flex items-center gap-3">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-bold">{s.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters — all in one row */}
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="no_issue">No Issue</SelectItem>
            <SelectItem value="detected">Detected</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="raised">Raised</SelectItem>
            <SelectItem value="recovered">Recovered</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={courierFilter} onValueChange={setCourierFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Couriers</SelectItem>
            {[...new Set(auditLogs.map((l: any) => l.courier_name).filter(Boolean))].sort().map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="weight">Weight</SelectItem>
            <SelectItem value="zone">Zone</SelectItem>
            <SelectItem value="rto">RTO</SelectItem>
            <SelectItem value="damage">Damage</SelectItem>
            <SelectItem value="unclassified">Unclassified</SelectItem>
            <SelectItem value="no_issue">No Issue</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36 text-sm" placeholder="From date" />
        <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36 text-sm" placeholder="To date" />
        {(dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>Clear dates</Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => setShowTypeDefs(true)}>
            <Info className="h-3.5 w-3.5" /> Type definitions
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => setShowStatusDefs(true)}>
            <Info className="h-3.5 w-3.5" /> Status definitions
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={20} searchable searchKeys={['awb', 'courier_name', 'order_id']} searchPlaceholder="Search AWB, courier, order..." />

      {/* Detail Modal */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Shipment Details — {selectedLog.awb}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm py-2">
              {[
                ['AWB', selectedLog.awb],
                ['Order ID', selectedLog.order_id || '—'],
                ['Courier', selectedLog.courier_name || '—'],
                ['Shipment Status', selectedLog.shipment_status || '—'],
                ['Charged Weight', selectedLog.charged_weight ? `${selectedLog.charged_weight} kg` : '—'],
                ['Expected Weight', selectedLog.max_expected_weight ? `${selectedLog.max_expected_weight} kg` : '—'],
                ['Charged Zone', selectedLog.charged_zone || '—'],
                ['Expected Zone', selectedLog.expected_zone || '—'],
                ['Billed Amount', selectedLog.billed_amount ? `₹${selectedLog.billed_amount}` : '—'],
                ['Expected Amount', selectedLog.expected_amount ? `₹${selectedLog.expected_amount}` : '—'],
                ['Discrepancy', selectedLog.discrepancy_amount ? `₹${selectedLog.discrepancy_amount}` : '—'],
                ['Status', STATUS_LABELS[getStatus(selectedLog)] || getStatus(selectedLog)],
                ['Type', TYPE_LABELS[getType(selectedLog)]],
                ['Date', selectedLog.created_at ? format(new Date(selectedLog.created_at), 'dd MMM yyyy') : '—'],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-muted-foreground text-xs">{label}</p>
                  <p className="font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Definitions Modal */}
      <Dialog open={showStatusDefs} onOpenChange={setShowStatusDefs}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Status Definitions</DialogTitle></DialogHeader>
          <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{STATUS_DEFINITIONS}</pre>
        </DialogContent>
      </Dialog>

      {/* Type Definitions Modal */}
      <Dialog open={showTypeDefs} onOpenChange={setShowTypeDefs}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Discrepancy Type Definitions</DialogTitle></DialogHeader>
          <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{TYPE_DEFINITIONS}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
