import { useState } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Package, AlertTriangle, Mail, IndianRupee, Upload, CheckSquare, Square, RefreshCw, Settings } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, subDays, format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import MetricCard from '@/components/dashboard/MetricCard';
import OnboardingChecklist from '@/components/dashboard/OnboardingChecklist';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardSkeleton } from '@/components/shared/LoadingSkeleton';
import { formatCurrency } from '@/lib/utils';

import { DISPUTE_STATUS_COLORS as STATUS_COLORS } from '@/lib/display-labels';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

export default function TenantDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('30');
  useDocumentTitle('Dashboard');

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats', user?.tenant_id, dateRange],
    queryFn: async () => {
      const tenantId = user?.tenant_id;
      if (!tenantId) throw new Error('NO_TENANT');

      const days = parseInt(dateRange);
      const startDate = subDays(new Date(), days);
      const prevStartDate = subDays(startDate, days);

      const [{ data: currentPeriod, error: e1 }, { data: prevPeriod, error: e2 }] = await Promise.all([
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
      if (e1) throw e1;
      if (e2) throw e2;

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

  // Check if rate card exists for onboarding checklist
  const { data: hasRateCard } = useQuery({
    queryKey: ['dashboard-has-ratecard', user?.tenant_id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('rate_cards')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', user!.tenant_id!);
      if (error) throw error;
      return (count || 0) > 0;
    },
    enabled: !!user?.tenant_id,
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

      const months: { month: string; recovered: number; disputed: number }[] = [];
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
        const disputed = inMonth.reduce((sum, l) => sum + (l.discrepancy_amount || 0), 0);
        months.push({ month: format(mStart, 'MMM'), recovered, disputed });
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

  // No tenant linked
  if (!user?.tenant_id) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-warning mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Account Not Linked</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Your account is not linked to a company yet. Please contact your administrator.
        </p>
        <Button variant="outline" onClick={() => navigate('/login')}>Back to Login</Button>
      </div>
    );
  }

  // Error state
  if (statsError && (statsError as any).message !== 'NO_TENANT') {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Load Dashboard</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Failed to load dashboard data. Please try refreshing.
        </p>
        <Button variant="default" onClick={() => refetchStats()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  // Empty state with onboarding checklist
  if (!isLoading && stats?.totalOrders === 0) {
    const checklist = [
      { label: 'Account Created', done: true },
      { label: 'Rate Card Configured', done: !!hasRateCard, action: () => navigate('/tenant-admin/settings'), actionLabel: 'Configure' },
      { label: 'First CSV Uploaded', done: false, action: () => navigate('/tenant-admin/upload'), actionLabel: 'Upload' },
    ];

    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {/* Onboarding checklist */}
        <div className="w-full max-w-sm mb-8 rounded-lg border border-border bg-card p-5 text-left">
          <h3 className="text-sm font-semibold text-foreground mb-3">Getting Started</h3>
          <div className="space-y-3">
            {checklist.map((item) => (
              <div key={item.label} className="flex items-center gap-2.5">
                {item.done ? (
                  <CheckSquare className="h-5 w-5 text-success flex-shrink-0" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground/50 flex-shrink-0" />
                )}
                <span className={`text-sm flex-1 ${item.done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {item.label}
                </span>
                {!item.done && item.action && (
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-primary px-2" onClick={item.action}>
                    {item.actionLabel}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <Upload className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to AuditEase AI!</h2>
        <p className="text-sm text-muted-foreground max-w-md mb-6">
          Get started by uploading your first courier billing CSV. We'll analyze it against your rate cards and find billing errors.
        </p>
        <div className="flex items-center gap-3">
          <Button variant="default" onClick={() => navigate('/tenant-admin/upload')}>
            <Upload className="h-4 w-4 mr-2" /> Upload CSV
          </Button>
          <Button variant="outline" onClick={() => navigate('/tenant-admin/settings')}>
            <Settings className="h-4 w-4 mr-2" /> Add Rate Card
          </Button>
        </div>
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
      {user?.tenant_id && <OnboardingChecklist tenantId={user.tenant_id} />}
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
        <MetricCard title="Orders Processed" value={(stats?.totalOrders ?? 0).toLocaleString()} change={stats?.ordersChange ?? 0} icon={Package} onClick={() => navigate('/tenant-admin/reports?tab=audit')} />
        <MetricCard title="Discrepancies Found" value={`${stats?.discrepancyCount ?? 0} (${formatCurrency(stats?.discrepancyAmount ?? 0)})`} change={0} icon={AlertTriangle} iconColor="text-warning" onClick={() => navigate('/tenant-admin/reports?tab=discrepancy')} />
        <MetricCard title="Disputes Active" value={String(stats?.activeDisputes ?? 0)} change={0} icon={Mail} iconColor="text-primary" onClick={() => navigate('/tenant-admin/disputes')} />
        <MetricCard title="Amount Recovered" value={`${formatCurrency(stats?.recoveredAmount ?? 0)} (${(stats?.recoveryRate ?? 0).toFixed(0)}%)`} change={stats?.recoveryChange ?? 0} icon={IndianRupee} iconColor="text-success" onClick={() => navigate('/tenant-admin/reports?tab=financial')} />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Discrepancy Breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={discrepancyTypes || []} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} onClick={(data) => navigate(`/tenant-admin/reports?tab=discrepancy&type=${data.name.toLowerCase()}`)} style={{ cursor: 'pointer' }}>
                {(discrepancyTypes || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Recovery Trend">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="disputed" name="Disputed (₹)" fill="hsl(38, 92%, 50%)" radius={[4,4,0,0]} />
              <Bar dataKey="recovered" name="Recovered (₹)" fill="hsl(160, 84%, 39%)" radius={[4,4,0,0]} />
            </BarChart>
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
