import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { getActionInfo, formatDetails, formatEntityType } from '@/lib/activity-actions';

export default function PlatformDashboard() {
  const navigate = useNavigate();
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

  // Recent activity logs — same query shape as ActivityLogs page
  const { data: activityLogs = [] } = useQuery({
    queryKey: ['platform-activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`*, users:user_id(full_name, email), tenants:tenant_id(company_name)`)
        .order('created_at', { ascending: false })
        .limit(50);
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
          summary: formatDetails(log.details),
        };
      });
    }
  });

  // Unique action legends from actual data
  const uniqueActions = useMemo(() => {
    const seen = new Map<string, { label: string; color: string; description: string }>();
    activityLogs.forEach((log: any) => {
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
      render: (row) => (
        <Badge variant="outline" className={row.actionColor}>{row.actionLabel}</Badge>
      ),
    },
    {
      key: 'summary',
      header: 'Summary',
      render: (row) => (
        <span className="text-sm text-muted-foreground">{row.summary}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* Metric Cards — each links to a specific report tab */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Tenants" value={String(totalTenants)} icon={Building2} iconColor="text-primary" onClick={() => navigate('/platform-admin/reports?tab=tenant')} />
        <MetricCard title="Active Tenants" value={String(activeTenants)} icon={Users} iconColor="text-success" onClick={() => navigate('/platform-admin/reports?tab=tenant')} />
        <MetricCard title="Monthly Revenue" value={formatCurrency(monthlyRevenue)} icon={IndianRupee} iconColor="text-warning" onClick={() => navigate('/platform-admin/reports?tab=financial')} />
        <MetricCard title="Total Recoveries" value={formatCurrency(totalRecoveries)} icon={TrendingUp} iconColor="text-accent" onClick={() => navigate('/platform-admin/reports?tab=courier')} />
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

        {/* Action Legends */}
        {uniqueActions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {uniqueActions.map((legend) => (
              <div key={legend.label} className="flex items-center gap-1.5" title={legend.description}>
                <Badge variant="outline" className={`${legend.color} text-xs`}>
                  {legend.label}
                </Badge>
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
