import { Package, AlertTriangle, IndianRupee, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { formatCurrency } from '@/lib/utils';

export default function ViewerDashboard() {
  const { user } = useAuth();

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['viewer-dashboard', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, discrepancy_amount, recovery_amount, dispute_status, created_at')
        .eq('tenant_id', user.tenant_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.tenant_id,
    staleTime: 1000 * 60 * 5,
  });

  const stats = useMemo(() => {
    const totalOrders = auditLogs.length;
    const discrepancies = auditLogs.filter(l => (l.discrepancy_amount ?? 0) > 0);
    const recovered = auditLogs.filter(l => l.dispute_status === 'recovered');
    const recoveredAmount = recovered.reduce((s, l) => s + (l.recovery_amount || 0), 0);
    const recoveryRate = discrepancies.length > 0 ? (recovered.length / discrepancies.length) * 100 : 0;
    return { totalOrders, discrepancyCount: discrepancies.length, recoveredAmount, recoveryRate };
  }, [auditLogs]);

  const monthlyTrend = useMemo(() => {
    const months: { month: string; disputes: number; resolved: number; recovered: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = startOfMonth(subMonths(new Date(), i));
      const mEnd = endOfMonth(subMonths(new Date(), i));
      const inMonth = auditLogs.filter(r => {
        const d = new Date(r.created_at!);
        return d >= mStart && d <= mEnd;
      });
      const disputes = inMonth.filter(l => (l.discrepancy_amount ?? 0) > 0).length;
      const resolved = inMonth.filter(l => l.dispute_status === 'recovered').length;
      const recoveredAmt = inMonth
        .filter(l => l.dispute_status === 'recovered')
        .reduce((sum, l) => sum + (l.recovery_amount || 0), 0);
      months.push({ month: format(mStart, 'MMM'), disputes, resolved, recovered: recoveredAmt });
    }
    return months;
  }, [auditLogs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Dashboard</h1><p className="text-sm text-muted-foreground">Overview of your company's audit performance</p></div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Orders Processed" value={stats.totalOrders.toLocaleString()} icon={Package} />
        <MetricCard title="Discrepancies" value={String(stats.discrepancyCount)} icon={AlertTriangle} iconColor="text-warning" />
        <MetricCard title="Recovered" value={formatCurrency(stats.recoveredAmount)} icon={IndianRupee} iconColor="text-success" />
        <MetricCard title="Recovery Rate" value={`${stats.recoveryRate.toFixed(1)}%`} icon={TrendingUp} iconColor="text-accent" />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Monthly Orders vs Discrepancies">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="disputes" name="Disputes" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Recovery Trend">
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
