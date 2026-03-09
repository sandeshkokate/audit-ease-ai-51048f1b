import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import { format, formatDistanceToNow } from 'date-fns';
import { Search, Loader2, AlertTriangle, Info, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { getActionInfo, formatDetails, formatEntityType, getAllActions } from '@/lib/activity-actions';
import { downloadCSV } from '@/lib/utils';

export default function ActivityLogs() {
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [tenantFilter, setTenantFilter] = useState('all');

  const { data: logs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['platform-activity-logs-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`*, users:user_id(full_name, email), tenants:tenant_id(company_name)`)
        .order('created_at', { ascending: false })
        .range(0, 999); // Explicit pagination guard
      if (error) throw error;
      return (data || []).map((log: any) => {
        const actionInfo = getActionInfo(log.action);
        return {
          id: log.id,
          time: log.created_at,
          tenant: log.tenants?.company_name || 'System',
          user: log.user_id ? (log.users?.full_name || log.users?.email || 'Unknown') : 'System',
          action: log.action || 'Activity',
          actionLabel: actionInfo.label,
          actionColor: actionInfo.color,
          affectedItem: formatEntityType(log.entity_type),
          summary: formatDetails(log.details),
        };
      });
    }
  });

  const uniqueTenants = useMemo(() => [...new Set(logs.map((l: any) => l.tenant).filter(Boolean))], [logs]);

  // Compute visible action legends from the data
  const visibleActions = useMemo(() => {
    const seen = new Map<string, { label: string; description: string; color: string }>();
    logs.forEach((l: any) => {
      const info = getActionInfo(l.action);
      if (!seen.has(info.label)) seen.set(info.label, info);
    });
    return Array.from(seen.values());
  }, [logs]);

  // Unique action labels for filter dropdown
  const uniqueActionLabels = useMemo(() => [...new Set(logs.map((l: any) => l.actionLabel))], [logs]);

  const filtered = logs.filter((l: any) => {
    const matchesAction = actionFilter === 'all' || l.actionLabel === actionFilter;
    const matchesTenant = tenantFilter === 'all' || l.tenant === tenantFilter;
    const matchesSearch = !searchQ || [l.actionLabel, l.tenant, l.user, l.summary].some(
      (v) => v?.toLowerCase().includes(searchQ.toLowerCase())
    );
    return matchesAction && matchesTenant && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div><div className="h-7 w-32 rounded bg-muted animate-pulse" /><div className="h-4 w-64 rounded bg-muted animate-pulse mt-2" /></div>
        <div className="flex gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 w-40 rounded bg-muted animate-pulse" />)}</div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3 border-t border-border">
              {Array.from({ length: 5 }).map((_, j) => (<div key={j} className="h-4 flex-1 rounded bg-muted animate-pulse" />))}
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

  const columns: Column<any>[] = [
    {
      key: 'time', header: 'When', sortable: true,
      render: (row) => (
        <div className="space-y-0.5">
          <span className="text-sm text-foreground">{format(new Date(row.time), 'dd MMM yyyy, HH:mm')}</span>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(row.time), { addSuffix: true })}</p>
        </div>
      ),
    },
    { key: 'tenant', header: 'Tenant', sortable: true },
    { key: 'user', header: 'User', sortable: true },
    {
      key: 'action', header: 'Action', sortable: true,
      render: (row) => (
        <Badge variant="outline" className={row.actionColor}>{row.actionLabel}</Badge>
      ),
    },
    {
      key: 'affectedItem', header: 'What Changed', sortable: true,
      render: (row) => <span className="text-sm">{row.affectedItem}</span>,
    },
    {
      key: 'summary', header: 'Summary',
      render: (row) => <span className="text-sm text-muted-foreground max-w-[260px] truncate block">{row.summary}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-sm text-muted-foreground">
            Track all platform activity — each log records a specific event such as a shipment audit, dispute update, or user action.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 self-start" onClick={() => downloadCSV(filtered.map(l => ({
          When: l.time, Tenant: l.tenant, User: l.user, Action: l.actionLabel,
          What_Changed: l.affectedItem, Summary: l.summary,
        })), 'activity_logs')}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Info callout — explains when logs are created */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 px-4 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Logs are created automatically when key events occur:&nbsp;
            <strong>shipments are audited</strong> (from CSV uploads),&nbsp;
            <strong>discrepancies are detected</strong>,&nbsp;
            <strong>disputes are raised or updated</strong>,&nbsp;
            <strong>recoveries are recorded</strong>, and&nbsp;
            <strong>users log in or settings change</strong>.
            The <strong>"What Changed"</strong> column shows the type of record affected, and <strong>"Summary"</strong> provides the key details.
          </p>
        </CardContent>
      </Card>

      {/* Action Legends — complete list from actual data */}
      {visibleActions.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {visibleActions.map((a) => (
            <div key={a.label} className="flex items-center gap-1.5" title={a.description}>
              <Badge variant="outline" className={`${a.color} text-xs`}>{a.label}</Badge>
              <span className="text-xs text-muted-foreground hidden sm:inline">— {a.description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search actions, tenants, users, details..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Filter by action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActionLabels.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tenantFilter} onValueChange={setTenantFilter}>
          <SelectTrigger className="w-52"><SelectValue placeholder="Filter by tenant" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tenants</SelectItem>
            {uniqueTenants.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={50} />
    </div>
  );
}
