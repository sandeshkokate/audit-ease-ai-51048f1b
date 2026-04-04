import { useState, useCallback } from 'react';
import { logger } from '@/lib/logger';
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
import { Download, Package, AlertTriangle, CheckCircle2, XCircle, Loader2, Weight, MapPin, RotateCcw, Info, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tables } from '@/integrations/supabase/types';
import {
  DISPUTE_STATUS_LABELS as STATUS_LABELS,
  DISPUTE_STATUS_COLORS as STATUS_COLORS,
  DISCREPANCY_TYPE_LABELS as TYPE_LABELS,
  AUDIT_STATUS_OPTIONS,
  AUDIT_TYPE_OPTIONS,
  STATUS_DEFINITIONS,
  TYPE_DEFINITIONS,
} from '@/lib/display-labels';
import {
  getActionableDiscrepancyStatus as getStatus,
  getActionableDiscrepancyType as getType,
  hasActionableDiscrepancy,
} from '@/lib/actionable-discrepancy';

type AuditLog = Tables<'audit_logs'>;

const AUDIT_PAGE_SIZE = 20;

export default function AuditLogs() {
  useDocumentTitle('Audit Logs');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');
  const [courierFilter, setCourierFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showStatusDefs, setShowStatusDefs] = useState(false);
  const [showTypeDefs, setShowTypeDefs] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Lightweight stats query
  const { data: stats = { total: 0, detected: 0, disputed: 0, resolved: 0, totalAmount: 0 } } = useQuery({
    queryKey: ['audit-stats', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return { total: 0, detected: 0, disputed: 0, resolved: 0, totalAmount: 0 };
      const { data, error } = await supabase
        .from('audit_logs')
        .select('overcharge_amount, status')
        .eq('tenant_id', user.tenant_id);
      if (error) throw error;
      const rows = data || [];
      return {
        total: rows.length,
        detected: rows.filter(r => ['detected', 'pending'].includes(getStatus(r))).length,
        disputed: rows.filter(r => hasActionableDiscrepancy(r) && ['raised', 'disputed', 'email_copied', 'draft'].includes(r.status || '')).length,
        resolved: rows.filter(r => hasActionableDiscrepancy(r) && r.status === 'recovered').length,
        totalAmount: rows.reduce((s, r) => s + (r.overcharge_amount || 0), 0),
      };
    },
    enabled: !!user?.tenant_id,
  });

  // Couriers for filter dropdown
  const { data: availableCouriers = [] } = useQuery({
    queryKey: ['audit-couriers', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data } = await supabase
        .from('audit_logs')
        .select('courier')
        .eq('tenant_id', user.tenant_id)
        .not('courier', 'is', null);
      return [...new Set((data || []).map(r => r.courier as string))].filter(Boolean).sort();
    },
    enabled: !!user?.tenant_id,
  });

  // Build server-side filters
  const applyFilters = useCallback((query: any) => {
    if (statusFilter === 'no_issue') {
      query = query.eq('status', 'no_issue');
    } else if (statusFilter === 'detected') {
      query = query.gt('overcharge_amount', 1).or('status.is.null,status.eq.detected,status.eq.pending');
    } else if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter).gt('overcharge_amount', 1);
    }

    if (courierFilter !== 'all') {
      query = query.eq('courier', courierFilter);
    }

    if (typeFilter === 'weight') query = query.eq('discrepancy_type', 'weight').gt('overcharge_amount', 1);
    else if (typeFilter === 'zone') query = query.eq('discrepancy_type', 'zone').gt('overcharge_amount', 1);
    else if (typeFilter === 'rto') query = query.eq('discrepancy_type', 'rto').gt('overcharge_amount', 1);
    else if (typeFilter === 'overcharge') query = query.eq('discrepancy_type', 'overcharge').gt('overcharge_amount', 1);
    else if (typeFilter === 'no_issue') query = query.eq('status', 'no_issue');

    if (searchQuery.trim()) {
      query = query.or(`awb_number.ilike.%${searchQuery}%,courier.ilike.%${searchQuery}%`);
    }

    if (dateFrom) query = query.gte('created_at', dateFrom);
    if (dateTo) query = query.lte('created_at', dateTo + 'T23:59:59');

    return query;
  }, [statusFilter, courierFilter, typeFilter, searchQuery, dateFrom, dateTo]);

  // Server-side paginated main query
  const { data: auditResult, isLoading, isError, refetch } = useQuery({
    queryKey: ['audit-logs', user?.tenant_id, page, statusFilter, courierFilter, typeFilter, searchQuery, dateFrom, dateTo],
    queryFn: async () => {
      if (!user?.tenant_id) return { rows: [], total: 0 };

      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('tenant_id', user.tenant_id);

      query = applyFilters(query);

      const from = page * AUDIT_PAGE_SIZE;
      const to = from + AUDIT_PAGE_SIZE - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { rows: data || [], total: count || 0 };
    },
    enabled: !!user?.tenant_id,
  });

  const auditLogs = auditResult?.rows ?? [];
  const totalCount = auditResult?.total ?? 0;
  const totalPages = Math.ceil(totalCount / AUDIT_PAGE_SIZE);

  // Export handler
  const handleExport = async () => {
    if (!user?.tenant_id) return;
    setExporting(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('tenant_id', user.tenant_id);

      query = applyFilters(query);

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) throw error;

      downloadCSV((data || []).map(l => ({
        AWB: l.awb_number, Courier: l.courier,
        Type: TYPE_LABELS[getType(l)], Billed_Weight: l.billed_weight,
        Expected_Weight: l.expected_weight, Overcharge_Amount: l.overcharge_amount,
        Status: STATUS_LABELS[getStatus(l)], Date: l.created_at ? format(new Date(l.created_at), 'dd MMM yyyy') : '',
      })), 'audit_logs');
    } catch (err: any) {
      logger.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-32 rounded bg-muted animate-pulse" />
            <div className="h-4 w-56 rounded bg-muted animate-pulse mt-2" />
          </div>
          <div className="h-9 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="h-3 w-12 rounded bg-muted animate-pulse" />
              <div className="h-6 w-16 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3 border-t border-border">
              {Array.from({ length: 6 }).map((_, j) => (
                <div key={j} className="h-4 flex-1 rounded bg-muted animate-pulse" />
              ))}
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
        <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  const columns: Column<any>[] = [
    { key: 'awb_number', header: <ColumnHeader title="AWB" tooltip="Air Waybill Number — unique shipment tracking ID assigned by the courier partner" />, sortable: true },
    { key: 'courier', header: <ColumnHeader title="Courier" tooltip="The logistics company that handled this shipment" />, sortable: true },
    {
      key: 'type',
      header: <ColumnHeader title="Type" tooltip="Category of billing error: Weight, Zone, RTO, or Unclassified" />,
      render: (r) => {
        const t = getType(r);
        return <Badge variant="outline">{TYPE_LABELS[t]}</Badge>;
      }
    },
    { key: 'billed_weight', header: <ColumnHeader title="Billed Wt" tooltip="Weight charged by courier (kg)." />, sortable: true, render: (r) => `${r.billed_weight ?? '—'} kg` },
    { key: 'expected_weight', header: <ColumnHeader title="Expected Wt" tooltip="Expected chargeable weight" />, render: (r) => `${r.expected_weight ?? '—'} kg` },
    { key: 'overcharge_amount', header: <ColumnHeader title="Discrepancy" tooltip="Amount overcharged" />, sortable: true, render: (r) => (r.overcharge_amount ?? 0) > 1 ? <span className="font-medium text-destructive">₹{r.overcharge_amount}</span> : <span className="text-muted-foreground">—</span> },
    {
      key: 'status',
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
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />} Export CSV
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

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search AWB, courier..."
            className="pl-8 w-56 text-sm"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {AUDIT_STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={courierFilter} onValueChange={(v) => { setCourierFilter(v); setPage(0); }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Couriers</SelectItem>
            {availableCouriers.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            {AUDIT_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className="w-36 text-sm" placeholder="From date" />
        <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className="w-36 text-sm" placeholder="To date" />
        {(dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setDateFrom(''); setDateTo(''); setPage(0); }}>Clear dates</Button>
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

      <p className="text-xs text-muted-foreground sm:hidden mb-1">← Scroll horizontally to see all columns →</p>

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="min-w-[800px]">
          <DataTable columns={columns} data={auditLogs} pageSize={AUDIT_PAGE_SIZE + 1} />
        </div>
      </div>

      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {totalCount} result{totalCount !== 1 ? 's' : ''}{totalPages > 1 ? ` — Page ${page + 1} of ${totalPages}` : ''}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(0)}><ChevronsLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}><ChevronsRight className="h-4 w-4" /></Button>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Shipment Details — {selectedLog.awb_number}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm py-2">
              {[
                ['AWB', selectedLog.awb_number],
                ['Courier', selectedLog.courier || '—'],
                ['Billed Weight', selectedLog.billed_weight ? `${selectedLog.billed_weight} kg` : '—'],
                ['Expected Weight', selectedLog.expected_weight ? `${selectedLog.expected_weight} kg` : '—'],
                ['Billed Zone', selectedLog.billed_zone || '—'],
                ['Expected Zone', selectedLog.expected_zone || '—'],
                ['Billed Value', selectedLog.billed_value ? `₹${selectedLog.billed_value}` : '—'],
                ['Expected Value', selectedLog.expected_value ? `₹${selectedLog.expected_value}` : '—'],
                ['Overcharge', selectedLog.overcharge_amount ? `₹${selectedLog.overcharge_amount}` : '—'],
                ['Discrepancy Type', selectedLog.discrepancy_type || '—'],
                ['Status', STATUS_LABELS[getStatus(selectedLog)] || getStatus(selectedLog)],
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

      <Dialog open={showStatusDefs} onOpenChange={setShowStatusDefs}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Status Definitions</DialogTitle></DialogHeader>
          <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{STATUS_DEFINITIONS}</pre>
        </DialogContent>
      </Dialog>

      <Dialog open={showTypeDefs} onOpenChange={setShowTypeDefs}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Discrepancy Type Definitions</DialogTitle></DialogHeader>
          <pre className="text-sm whitespace-pre-wrap text-muted-foreground">{TYPE_DEFINITIONS}</pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
