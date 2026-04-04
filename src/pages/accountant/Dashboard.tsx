import { Package, AlertTriangle, IndianRupee, FileText, Loader2 } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, subMonths, endOfMonth, format } from 'date-fns';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

export default function AccountantDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['accountant-stats', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) throw new Error('No tenant');
      const { data } = await supabase
        .from('audit_logs')
        .select('id, overcharge_amount, status')
        .eq('tenant_id', user.tenant_id);

      const logs = data || [];
      const discrepancies = logs.filter(l => (l.overcharge_amount ?? 0) > 1);
      const recovered = logs.filter(l => l.status === 'recovered');
      const recoveredAmount = recovered.reduce((s, l) => s + (l.overcharge_amount ?? 0), 0);
      const discrepancyAmount = discrepancies.reduce((s, l) => s + (l.overcharge_amount ?? 0), 0);

      return {
        totalOrders: logs.length,
        discrepancyCount: discrepancies.length,
        discrepancyAmount,
        recoveredAmount,
      };
    },
    enabled: !!user?.tenant_id,
  });

  const { data: pendingInvoices = 0 } = useQuery({
    queryKey: ['accountant-pending-invoices', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return 0;
      const { count } = await supabase
        .from('invoices')
        .select('id', { count: 'exact', head: true })
        .eq('tenant_id', user.tenant_id)
        .eq('status', 'generated');
      return count ?? 0;
    },
    enabled: !!user?.tenant_id,
  });

  const { data: discrepancyTypes = [] } = useQuery({
    queryKey: ['accountant-discrepancy-types', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data } = await supabase
        .from('audit_logs')
        .select('discrepancy_type, overcharge_amount')
        .eq('tenant_id', user.tenant_id)
        .gt('overcharge_amount', 1);

      const counts: Record<string, number> = { Weight: 0, Zone: 0, RTO: 0, Other: 0 };
      data?.forEach(r => {
        const t = r.discrepancy_type?.toLowerCase() ?? '';
        if (t === 'weight') counts.Weight++;
        else if (t === 'zone') counts.Zone++;
        else if (t === 'rto') counts.RTO++;
        else counts.Other++;
      });
      return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
    },
    enabled: !!user?.tenant_id,
  });

  const { data: monthlyTrend = [] } = useQuery({
    queryKey: ['accountant-monthly-trend', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
      const { data } = await supabase
        .from('audit_logs')
        .select('id, overcharge_amount, status, created_at')
        .eq('tenant_id', user.tenant_id)
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
          .filter(l => l.status === 'recovered')
          .reduce((sum, l) => sum + (l.overcharge_amount || 0), 0);
        months.push({ month: format(mStart, 'MMM'), recovered });
      }
      return months;
    },
    enabled: !!user?.tenant_id,
  });

  if (statsLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Accountant Dashboard</h1><p className="text-sm text-muted-foreground">Financial overview of audits and recoveries</p></div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Orders Processed" value={(stats?.totalOrders ?? 0).toLocaleString()} icon={Package} />
        <MetricCard title="Discrepancies" value={`${stats?.discrepancyCount ?? 0} (${formatCurrency(stats?.discrepancyAmount ?? 0)})`} icon={AlertTriangle} iconColor="text-warning" />
        <MetricCard title="Amount Recovered" value={formatCurrency(stats?.recoveredAmount ?? 0)} icon={IndianRupee} iconColor="text-success" />
        <MetricCard title="Pending Invoices" value={String(pendingInvoices)} icon={FileText} iconColor="text-primary" />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Discrepancy Breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={discrepancyTypes} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {discrepancyTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Recovery Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="recovered" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
