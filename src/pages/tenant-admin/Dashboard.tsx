import { useState } from 'react';
import { Package, AlertTriangle, Mail, IndianRupee, Upload } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, subDays, format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];
const STATUS_COLORS: Record<string, string> = {
  no_issue: 'bg-muted/50 text-muted-foreground border-muted',
  pending: 'bg-warning/10 text-warning border-warning/20',
  raised: 'bg-primary/10 text-primary border-primary/20',
  recovered: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted/50 text-muted-foreground border-muted',
};

export default function TenantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.tenant_id, dateRange],
    queryFn: async () => {
      const tenantId = user?.tenant_id;
      if (!tenantId) throw new Error('No tenant found');

      const days = parseInt(dateRange);
      const startDate = subDays(new Date(), days);
      const prevStartDate = subDays(startDate, days);

      const [{ data: currentPeriod }, { data: prevPeriod }] = await Promise.all([
        supabase
          .from('audit_logs')
          .select('id, discrepancy_amount, recovery_amount, dispute_status')
          .eq('tenant_id', tenantId)
          .gte('created_at', startDate.toISOString()),
        supabase
          .from('audit_logs')
          .select('id, discrepancy_amount, recovery_amount, dispute_status')
          .eq('tenant_id', tenantId)
          .gte('created_at', prevStartDate.toISOString())
          .lt('created_at', startDate.toISOString()),
      ]);

      const currentOrders = currentPeriod?.length || 0;
      const currentDiscrepancies = currentPeriod?.filter(l => (l.discrepancy_amount ?? 0) > 0) || [];
      const currentRecovered = currentPeriod?.filter(l => l.dispute_status === 'recovered') || [];
      const currentRecoveredAmount = currentRecovered.reduce((sum, l) => sum + (l.recovery_amount || 0), 0);
      const currentDiscrepancyAmount = currentDiscrepancies.reduce((sum, l) => sum + (l.discrepancy_amount ?? 0), 0);
      const activeDisputes = currentPeriod?.filter(l => l.dispute_status === 'raised').length || 0;

      const lastOrders = prevPeriod?.length || 0;
      const lastRecoveredAmount = prevPeriod?.filter(l => l.dispute_status === 'recovered')
        .reduce((sum, l) => sum + (l.recovery_amount || 0), 0) || 0;

      const ordersChange = lastOrders > 0 ? ((currentOrders - lastOrders) / lastOrders * 100) : 0;
      const recoveryChange = lastRecoveredAmount > 0 ? ((currentRecoveredAmount - lastRecoveredAmount) / lastRecoveredAmount * 100) : 0;

      return {
        totalOrders: currentOrders,
        discrepancyCount: currentDiscrepancies.length,
        discrepancyAmount: currentDiscrepancyAmount,
        activeDisputes,
        recoveredAmount: currentRecoveredAmount,
        recoveryRate: currentDiscrepancies.length > 0
          ? (currentRecovered.length / currentDiscrepancies.length * 100)
          : 0,
        ordersChange,
        recoveryChange,
      };
    },
    enabled: !!user?.tenant_id,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch monthly trend (last 6 months)
  const { data: monthlyTrend, isLoading: trendLoading } = useQuery({
    queryKey: ['dashboard-trend', user?.tenant_id],
    queryFn: async () => {
      const tenantId = user?.tenant_id;
      if (!tenantId) return [];

      const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
      const { data } = await supabase
        .from('audit_logs')
        .select('id, discrepancy_amount, recovery_amount, dispute_status, created_at')
        .eq('tenant_id', tenantId)
        .gte('created_at', sixMonthsAgo.toISOString());

      const months: { month: string; recovered: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const mStart = startOfMonth(subMonths(new Date(), i));
        const mEnd = endOfMonth(subMonths(new Date(), i));
        const inMonth = data?.filter(r => {
          const d = new Date(r.created_at!);
          return d >= mStart && d <= mEnd;
        }) || [];
        const recovered = inMonth
          .filter(l => l.dispute_status === 'recovered')
          .reduce((sum, l) => sum + (l.recovery_amount || 0), 0);
        months.push({ month: format(mStart, 'MMM'), recovered });
      }
      return months;
    },
    enabled: !!user?.tenant_id,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch discrepancy breakdown
  const { data: discrepancyTypes } = useQuery({
    queryKey: ['dashboard-discrepancy-types', user?.tenant_id],
    queryFn: async () => {
      const tenantId = user?.tenant_id;
      if (!tenantId) return [];
      const { data } = await supabase
        .from('audit_logs')
        .select('has_weight_discrepancy, has_zone_discrepancy, has_rto_overcharge, has_damage_misclassification, discrepancy_amount')
        .eq('tenant_id', tenantId)
        .gt('discrepancy_amount', 0);

      const counts = { Weight: 0, Zone: 0, RTO: 0, Damage: 0, Other: 0 };
      data?.forEach(r => {
        if (r.has_weight_discrepancy) counts.Weight++;
        else if (r.has_zone_discrepancy) counts.Zone++;
        else if (r.has_rto_overcharge) counts.RTO++;
        else if (r.has_damage_misclassification) counts.Damage++;
        else counts.Other++;
      });
      return Object.entries(counts)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }));
    },
    enabled: !!user?.tenant_id,
    staleTime: 1000 * 60 * 10,
  });

  // Fetch recent audit logs
  const { data: recentLogs } = useQuery({
    queryKey: ['dashboard-recent-logs', user?.tenant_id],
    queryFn: async () => {
      const tenantId = user?.tenant_id;
      if (!tenantId) return [];
      const { data } = await supabase
        .from('audit_logs')
        .select('id, awb, courier_name, discrepancy_amount, dispute_status, created_at')
        .eq('tenant_id', tenantId)
        .gt('discrepancy_amount', 0)
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
    enabled: !!user?.tenant_id,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = statsLoading || trendLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isLoading && stats?.totalOrders === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Data Yet</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Upload your first CSV file to start auditing shipments
        </p>
        <Button variant="default" onClick={() => navigate('/tenant-admin/upload')}>
          Upload CSV
        </Button>
      </div>
    );
  }

  const columns: Column<any>[] = [
    { key: 'awb', header: 'AWB', sortable: true },
    { key: 'courier_name', header: 'Courier', sortable: true },
    { key: 'discrepancy_amount', header: 'Amount', sortable: true, render: (r) => <span className="font-medium text-destructive">₹{r.discrepancy_amount}</span> },
    { key: 'dispute_status', header: 'Status', render: (r) => <Badge variant="outline" className={STATUS_COLORS[r.dispute_status] || ''}>{r.dispute_status}</Badge> },
    { key: 'created_at', header: 'Time', render: (r) => <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user?.full_name}</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Orders Processed" value={(stats?.totalOrders ?? 0).toLocaleString()} change={stats?.ordersChange ?? 0} icon={Package} />
        <MetricCard title="Discrepancies Found" value={`${stats?.discrepancyCount ?? 0} (${formatCurrency(stats?.discrepancyAmount ?? 0)})`} change={0} icon={AlertTriangle} iconColor="text-warning" />
        <MetricCard title="Disputes Active" value={String(stats?.activeDisputes ?? 0)} change={0} icon={Mail} iconColor="text-primary" />
        <MetricCard title="Amount Recovered" value={`${formatCurrency(stats?.recoveredAmount ?? 0)} (${(stats?.recoveryRate ?? 0).toFixed(0)}%)`} change={stats?.recoveryChange ?? 0} icon={IndianRupee} iconColor="text-success" />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Discrepancy Breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={discrepancyTypes || []} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {(discrepancyTypes || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Recovery Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="recovered" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent Discrepancies</h2>
        <DataTable columns={columns} data={recentLogs || []} pageSize={10} searchable searchKeys={['awb', 'courier_name']} searchPlaceholder="Search AWB or courier..." />
      </div>
    </div>
  );
}
