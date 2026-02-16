import { Package, AlertTriangle, IndianRupee, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import { mockAuditLogs, mockMonthlyRecovery } from '@/lib/tenant-mock-data';
import { mockDiscrepancyTypes } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

export default function AccountantDashboard() {
  const totalOrders = mockAuditLogs.length;
  const discrepancies = mockAuditLogs.filter(l => l.discrepancy_amount > 20);
  const discrepancyAmount = discrepancies.reduce((s, l) => s + l.discrepancy_amount, 0);
  const recovered = mockAuditLogs.filter(l => l.status === 'resolved');
  const recoveredAmount = recovered.reduce((s, l) => s + l.discrepancy_amount, 0);
  const pendingInvoices = 2;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Accountant Dashboard</h1><p className="text-sm text-muted-foreground">Financial overview of audits and recoveries</p></div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Orders Processed" value={totalOrders.toLocaleString()} change={8.5} icon={Package} />
        <MetricCard title="Discrepancies" value={`${discrepancies.length} (${formatCurrency(discrepancyAmount)})`} change={12.3} icon={AlertTriangle} iconColor="text-warning" />
        <MetricCard title="Amount Recovered" value={formatCurrency(recoveredAmount)} change={15.1} icon={IndianRupee} iconColor="text-success" />
        <MetricCard title="Pending Invoices" value={String(pendingInvoices)} icon={FileText} iconColor="text-primary" />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <ChartCard title="Discrepancy Breakdown">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={mockDiscrepancyTypes} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {mockDiscrepancyTypes.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Monthly Recovery Trend">
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
