import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { format, formatDistanceToNow } from 'date-fns';
import { Search, Loader2, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

// Human-readable action definitions with consistent labels
const ACTION_MAP: Record<string, { label: string; description: string; color: string }> = {
  'user.login': { label: 'User Login', description: 'A user signed into the platform', color: 'bg-primary/10 text-primary border-primary/20' },
  'user.logout': { label: 'User Logout', description: 'A user signed out', color: 'bg-muted text-muted-foreground border-border' },
  'user.created': { label: 'User Created', description: 'A new user account was created', color: 'bg-success/10 text-success border-success/20' },
  'csv.upload': { label: 'CSV Upload', description: 'Shipment data file was uploaded for auditing', color: 'bg-secondary/10 text-secondary border-secondary/20' },
  'dispute.created': { label: 'Dispute Raised', description: 'A new billing dispute was raised against a courier', color: 'bg-warning/10 text-warning border-warning/20' },
  'dispute.updated': { label: 'Dispute Updated', description: 'A dispute status was changed (e.g. resolved, rejected)', color: 'bg-accent/10 text-accent border-accent/20' },
  'tenant.created': { label: 'Tenant Onboarded', description: 'A new tenant/company was added to the platform', color: 'bg-primary/10 text-primary border-primary/20' },
  'settings.updated': { label: 'Settings Changed', description: 'Platform or tenant configuration was modified', color: 'bg-muted text-muted-foreground border-border' },
  'invoice.generated': { label: 'Invoice Generated', description: 'A commission invoice was generated for a tenant', color: 'bg-warning/10 text-warning border-warning/20' },
  'recovery.recorded': { label: 'Recovery Recorded', description: 'A recovery amount was recorded against a dispute', color: 'bg-success/10 text-success border-success/20' },
};

function getActionInfo(action: string) {
  const normalized = action?.toLowerCase().replace(/\s+/g, '.') || '';
  // Try exact match first
  if (ACTION_MAP[normalized]) return ACTION_MAP[normalized];
  // Try partial match
  for (const [pattern, info] of Object.entries(ACTION_MAP)) {
    if (normalized.includes(pattern.split('.')[0])) return info;
  }
  return { label: action || 'Activity', description: '', color: 'bg-muted text-muted-foreground border-border' };
}

export default function ActivityLogs() {
  const [userFilter, setUserFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const { data: logs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['platform-activity-logs-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          users:user_id(full_name, email),
          tenants:tenant_id(company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(500);
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
          entityType: log.entity_type || '-',
          entityId: log.entity_id || '-',
          details: log.details || '-',
        };
      });
    }
  });

  const uniqueUsers = [...new Set(logs.map((l: any) => l.user))];
  const uniqueEntities = [...new Set(logs.map((l: any) => l.entityType).filter((e: string) => e !== '-'))];

  // Compute visible action legends from filtered data
  const visibleActions = (() => {
    const seen = new Map<string, { label: string; description: string; color: string }>();
    logs.forEach((l: any) => {
      const info = getActionInfo(l.action);
      if (!seen.has(info.label)) seen.set(info.label, info);
    });
    return Array.from(seen.values());
  })();

  const filtered = logs.filter((l: any) => {
    const matchesUser = userFilter === 'all' || l.user === userFilter;
    const matchesEntity = entityFilter === 'all' || l.entityType === entityFilter;
    const matchesSearch = !searchQ || l.actionLabel.toLowerCase().includes(searchQ.toLowerCase()) || l.tenant.toLowerCase().includes(searchQ.toLowerCase()) || l.details.toLowerCase().includes(searchQ.toLowerCase());
    return matchesUser && matchesSearch && matchesEntity;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      key: 'time', header: <ColumnHeader title="Time" tooltip="When this activity occurred" />, sortable: true,
      render: (row) => (
        <div className="space-y-0.5">
          <span className="text-sm text-foreground">{format(new Date(row.time), 'dd MMM yyyy, HH:mm')}</span>
          <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(row.time), { addSuffix: true })}</p>
        </div>
      ),
    },
    { key: 'tenant', header: <ColumnHeader title="Tenant" tooltip="The company/tenant where this activity happened" />, sortable: true },
    { key: 'user', header: <ColumnHeader title="User" tooltip="The user who performed this action" />, sortable: true },
    {
      key: 'action', header: <ColumnHeader title="Action" tooltip="Type of activity performed" />, sortable: true,
      render: (row) => (
        <Badge variant="outline" className={row.actionColor}>{row.actionLabel}</Badge>
      ),
    },
    { key: 'entityType', header: <ColumnHeader title="Entity" tooltip="What was affected — e.g. order, upload_batch, tenant, user" />, sortable: true,
      render: (row) => <span className="text-sm capitalize">{row.entityType.replace(/_/g, ' ')}</span>
    },
    { key: 'details', header: <ColumnHeader title="Details" tooltip="Additional context about the activity" />,
      render: (row) => <span className="text-sm text-muted-foreground max-w-[200px] truncate block">{row.details}</span>
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">Track all platform activity — each log represents a specific user or system action (e.g. login, CSV upload, dispute raised)</p>
      </div>

      {/* Info callout */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 px-4 flex items-start gap-2">
          <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">
            Logs are recorded at the <strong>action level</strong> — each entry represents a single event such as a user login, a CSV file upload, a dispute being raised, or a recovery being recorded. 
            The <strong>Entity</strong> column shows what was affected (e.g. an order, upload batch, or user account).
          </p>
        </CardContent>
      </Card>

      {/* Action Legends */}
      {visibleActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
          <Input placeholder="Search actions, tenants, details..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by user" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {uniqueUsers.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by entity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {uniqueEntities.map((e) => <SelectItem key={e} value={e}>{e.replace(/_/g, ' ')}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={50} />
    </div>
  );
}
