import { Package, AlertTriangle, IndianRupee, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { mockAuditLogs, mockMonthlyRecovery } from '@/lib/tenant-mock-data';
import { formatCurrency } from '@/lib/utils';

export default function ViewerDashboard() {
  const totalOrders = mockAuditLogs.length;
  const discrepancies = mockAuditLogs.filter(l => l.discrepancy_amount > 20);
  const recovered = mockAuditLogs.filter(l => l.status === 'resolved');
  const recoveredAmount = recovered.reduce((s, l) => s + l.discrepancy_amount, 0);
  const recoveryRate = totalOrders > 0 ? ((recovered.length / totalOrders) * 100) : 0;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Dashboard</h1><p className="text-sm text-muted-foreground">Overview of your company's audit performance</p></div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Orders Processed" value={totalOrders.toLocaleString()} change={8.5} icon={Package} />
        <MetricCard title="Discrepancies" value={String(discrepancies.length)} change={12.3} icon={AlertTriangle} iconColor="text-warning" />
        <MetricCard title="Recovered" value={formatCurrency(recoveredAmount)} change={15.1} icon={IndianRupee} iconColor="text-success" />
        <MetricCard title="Recovery Rate" value={`${recoveryRate.toFixed(1)}%`} change={3.2} icon={TrendingUp} iconColor="text-accent" />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Monthly Orders vs Discrepancies">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={mockMonthlyRecovery}>
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
            <LineChart data={mockMonthlyRecovery}>
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
