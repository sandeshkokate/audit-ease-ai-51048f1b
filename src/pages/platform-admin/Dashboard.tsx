import { Building2, Users, IndianRupee, TrendingUp, Loader2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { formatCurrency } from '@/lib/utils';

export default function PlatformDashboard() {
  // Fetch all tenants
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

  // Fetch platform-wide stats
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

  // Fetch tenant growth (last 6 months) — single query
  const { data: tenantGrowth = [] } = useQuery({
    queryKey: ['platform-tenant-growth'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tenants')
        .select('created_at')
        .gte('created_at', subMonths(new Date(), 6).toISOString())
        .order('created_at', { ascending: true });

      const monthCounts: Record<string, number> = {};
      (data || []).forEach(t => {
        const month = format(new Date(t.created_at!), 'MMM');
        monthCounts[month] = (monthCounts[month] || 0) + 1;
      });

      return Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        const month = format(d, 'MMM');
        return { month, count: monthCounts[month] || 0 };
      });
    }
  });

  // Fetch revenue by month (last 6 months) — single query
  const { data: revenueByMonth = [] } = useQuery({
    queryKey: ['platform-revenue-by-month'],
    queryFn: async () => {
      const { data } = await supabase
        .from('invoices')
        .select('commission_amount, created_at')
        .gte('created_at', subMonths(new Date(), 6).toISOString())
        .order('created_at', { ascending: true });

      const monthRevenue: Record<string, number> = {};
      (data || []).forEach(inv => {
        const month = format(new Date(inv.created_at!), 'MMM');
        monthRevenue[month] = (monthRevenue[month] || 0) + (inv.commission_amount || 0);
      });

      return Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        const month = format(d, 'MMM');
        return { month, revenue: monthRevenue[month] || 0 };
      });
    }
  });

  // Fetch recent activity logs
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
        .limit(20);
      
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
      render: (row) => <span className="text-sm">{row.action}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Tenants" value={String(totalTenants)} icon={Building2} iconColor="text-primary" />
        <MetricCard title="Active Tenants" value={String(activeTenants)} icon={Users} iconColor="text-success" />
        <MetricCard title="Monthly Revenue" value={formatCurrency(monthlyRevenue)} icon={IndianRupee} iconColor="text-warning" />
        <MetricCard title="Total Recoveries" value={formatCurrency(totalRecoveries)} icon={TrendingUp} iconColor="text-accent" />
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
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent Activity</h2>
        {activityLogs.length > 0 ? (
          <DataTable columns={activityColumns} data={activityLogs} pageSize={10} />
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </div>
    </div>
  );
}
