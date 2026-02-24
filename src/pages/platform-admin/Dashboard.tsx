import { useState, useMemo } from 'react';
import { Building2, Users, IndianRupee, TrendingUp, Loader2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

// Consistent action map — same as ActivityLogs page
const ACTION_MAP: Record<string, { label: string; color: string; description: string }> = {
  'user.login': { label: 'User Login', color: 'bg-primary/10 text-primary border-primary/20', description: 'A user signed into the platform' },
  'user.logout': { label: 'User Logout', color: 'bg-muted text-muted-foreground border-border', description: 'A user signed out' },
  'csv.upload': { label: 'CSV Upload', color: 'bg-success/10 text-success border-success/20', description: 'Shipment data file uploaded' },
  'dispute.created': { label: 'Dispute Raised', color: 'bg-warning/10 text-warning border-warning/20', description: 'New billing dispute raised' },
  'dispute.updated': { label: 'Dispute Updated', color: 'bg-accent/10 text-accent border-accent/20', description: 'Dispute status changed' },
  'tenant.created': { label: 'Tenant Onboarded', color: 'bg-secondary/10 text-secondary border-secondary/20', description: 'New tenant added' },
  'settings.updated': { label: 'Settings Changed', color: 'bg-primary/10 text-primary border-primary/20', description: 'Configuration modified' },
  'user.created': { label: 'User Created', color: 'bg-success/10 text-success border-success/20', description: 'New user account created' },
  'invoice.generated': { label: 'Invoice Generated', color: 'bg-warning/10 text-warning border-warning/20', description: 'Commission invoice generated' },
  'recovery.recorded': { label: 'Recovery Recorded', color: 'bg-success/10 text-success border-success/20', description: 'Recovery amount recorded' },
};

function getActionInfo(action: string) {
  const normalized = action?.toLowerCase().replace(/\s+/g, '.') || '';
  if (ACTION_MAP[normalized]) return ACTION_MAP[normalized];
  for (const [pattern, info] of Object.entries(ACTION_MAP)) {
    if (normalized.includes(pattern.split('.')[0])) return info;
  }
  return { label: action || 'Activity', color: 'bg-muted text-muted-foreground border-border', description: '' };
}

export default function PlatformDashboard() {
  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ['platform-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const { data: auditLogs } = await supabase
        .from('audit_logs')
        .select('id, discrepancy_amount, recovery_amount, dispute_status, created_at');

      const totalRecovered = auditLogs?.reduce((sum, log) => sum + (log.recovery_amount || 0), 0) || 0;
      const totalDiscrepancy = auditLogs?.reduce((sum, log) => sum + (log.discrepancy_amount || 0), 0) || 0;

      const { data: invoices } = await supabase
        .from('invoices')
        .select('commission_amount, created_at')
        .gte('created_at', subMonths(new Date(), 1).toISOString());

      const monthlyRevenue = invoices?.reduce((sum, inv) => sum + (inv.commission_amount || 0), 0) || 0;

      return { totalRecovered, totalDiscrepancy, monthlyRevenue };
    }
  });

  // Tenant growth — chronologically sorted
  const { data: tenantGrowth = [] } = useQuery({
    queryKey: ['platform-tenant-growth'],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { data } = await supabase
          .from('tenants')
          .select('id')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        months.push({
          month: format(monthStart, 'MMM yyyy'),
          sortKey: format(monthStart, 'yyyy-MM'),
          count: data?.length || 0,
        });
      }
      return months.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }
  });

  // Revenue by month — chronologically sorted
  const { data: revenueByMonth = [] } = useQuery({
    queryKey: ['platform-revenue-by-month'],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { data } = await supabase
          .from('invoices')
          .select('commission_amount')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const revenue = data?.reduce((s, d) => s + (d.commission_amount || 0), 0) || 0;
        months.push({
          month: format(monthStart, 'MMM yyyy'),
          sortKey: format(monthStart, 'yyyy-MM'),
          revenue,
        });
      }
      return months.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    }
  });

  // Recent activity logs
  const { data: activityLogs = [] } = useQuery({
    queryKey: ['platform-activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          users:user_id(full_name, email),
          tenants:tenant_id(company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      return (data || []).map((log: any) => ({
        id: log.id,
        time: log.created_at,
        tenant: log.tenants?.company_name || 'System',
        user: log.user_id ? (log.users?.full_name || log.users?.email || 'Unknown') : 'System',
        action: log.action || log.details || 'Activity'
      }));
    }
  });

  // Unique action legends from actual data
  const uniqueActions = useMemo(() => {
    const seen = new Map<string, { label: string; color: string; description: string }>();
    activityLogs.forEach(log => {
      const info = getActionInfo(log.action);
      if (!seen.has(info.label)) seen.set(info.label, info);
    });
    return Array.from(seen.values());
  }, [activityLogs]);

  const isLoading = tenantsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t: any) => t.status === 'active').length;
  const monthlyRevenue = stats?.monthlyRevenue || 0;
  const totalRecoveries = stats?.totalRecovered || 0;

  const activityColumns: Column<any>[] = [
    {
      key: 'time',
      header: 'Time',
      render: (row) => (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(row.time), { addSuffix: true })}
        </span>
      ),
    },
    { key: 'tenant', header: 'Tenant' },
    { key: 'user', header: 'User' },
    {
      key: 'action',
      header: 'Action',
      render: (row) => {
        const info = getActionInfo(row.action);
        return (
          <Badge variant="outline" className={info.color}>
            {info.label}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* Metric Cards — clickable drill-down */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Tenants" value={String(totalTenants)} icon={Building2} iconColor="text-primary" href="/platform-admin/tenants" />
        <MetricCard title="Active Tenants" value={String(activeTenants)} icon={Users} iconColor="text-success" href="/platform-admin/tenants" />
        <MetricCard title="Monthly Revenue" value={formatCurrency(monthlyRevenue)} icon={IndianRupee} iconColor="text-warning" href="/platform-admin/reports" />
        <MetricCard title="Total Recoveries" value={formatCurrency(totalRecoveries)} icon={TrendingUp} iconColor="text-accent" href="/platform-admin/reports" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Tenant Growth">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={tenantGrowth}>
              <defs>
                <linearGradient id="tenantGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(215, 16%, 47%)' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(215, 16%, 47%)' }} />
              <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 32%, 91%)', borderRadius: '8px', fontSize: '13px' }} />
              <Area type="monotone" dataKey="count" stroke="hsl(221, 83%, 53%)" fill="url(#tenantGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Month">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueByMonth}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 72%, 48%)" />
                  <stop offset="100%" stopColor="hsl(221, 83%, 53%)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(215, 16%, 47%)' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(215, 16%, 47%)' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 32%, 91%)', borderRadius: '8px', fontSize: '13px' }} formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Recent Activity</h2>
        
        {/* Action Legends — consistent with ActivityLogs page */}
        {uniqueActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {uniqueActions.map((legend) => (
              <div key={legend.label} className="flex items-center gap-1.5" title={legend.description}>
                <Badge variant="outline" className={`${legend.color} text-xs`}>
                  {legend.label}
                </Badge>
                {legend.description && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">— {legend.description}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {activityLogs.length > 0 ? (
          <DataTable columns={activityColumns} data={activityLogs} pageSize={10} />
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </div>
    </div>
  );
}
