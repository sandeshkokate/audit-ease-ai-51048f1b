import { Building2, Users, IndianRupee, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { mockTenants, mockTenantGrowth, mockRevenueByMonth, mockActivityLogs } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

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

export default function PlatformDashboard() {
  const totalTenants = mockTenants.length;
  const activeTenants = mockTenants.filter((t) => t.status === 'active').length;
  const monthlyRevenue = 690000;
  const totalRecoveries = 13350000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview and key metrics</p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Tenants" value={String(totalTenants)} change={12.5} icon={Building2} iconColor="text-primary" />
        <MetricCard title="Active Tenants" value={String(activeTenants)} change={8.3} icon={Users} iconColor="text-success" />
        <MetricCard title="Monthly Revenue" value={`₹${(monthlyRevenue / 100000).toFixed(2)} L`} change={11.2} icon={IndianRupee} iconColor="text-warning" />
        <MetricCard title="Total Recoveries" value={`₹${(totalRecoveries / 10000000).toFixed(2)} Cr`} change={15.7} icon={TrendingUp} iconColor="text-accent" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Tenant Growth">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={mockTenantGrowth}>
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
            <BarChart data={mockRevenueByMonth}>
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
        <DataTable columns={activityColumns} data={mockActivityLogs.slice(0, 20)} pageSize={10} />
      </div>
    </div>
  );
}
