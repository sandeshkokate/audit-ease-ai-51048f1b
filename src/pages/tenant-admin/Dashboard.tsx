import { Package, AlertTriangle, Mail, IndianRupee } from 'lucide-react';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MetricCard from '@/components/dashboard/MetricCard';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { mockAuditLogs, mockMonthlyRecovery } from '@/lib/tenant-mock-data';
import { mockDiscrepancyTypes } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];
const STATUS_COLORS: Record<string, string> = {
  detected: 'bg-warning/10 text-warning border-warning/20',
  disputed: 'bg-primary/10 text-primary border-primary/20',
  resolved: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function TenantDashboard() {
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const totalOrders = mockAuditLogs.length;
  const discrepancies = mockAuditLogs.filter(l => l.discrepancy_amount > 20);
  const discrepancyAmount = discrepancies.reduce((s, l) => s + l.discrepancy_amount, 0);
  const activeDisputes = mockAuditLogs.filter(l => l.status === 'disputed').length;
  const recovered = mockAuditLogs.filter(l => l.status === 'resolved');
  const recoveredAmount = recovered.reduce((s, l) => s + l.discrepancy_amount, 0);
  const recoveryRate = totalOrders > 0 ? ((recovered.length / totalOrders) * 100) : 0;

  const columns: Column<any>[] = [
    { key: 'awb_number', header: 'AWB', sortable: true },
    { key: 'courier', header: 'Courier', sortable: true },
    { key: 'discrepancy_type', header: 'Type', render: (r) => <Badge variant="outline" className="capitalize">{r.discrepancy_type}</Badge> },
    { key: 'discrepancy_amount', header: 'Amount', sortable: true, render: (r) => <span className="font-medium text-destructive">₹{r.discrepancy_amount}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant="outline" className={STATUS_COLORS[r.status]}>{r.status}</Badge> },
    { key: 'created_at', header: 'Time', render: (r) => <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span> },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Dashboard</h1><p className="text-sm text-muted-foreground">Your audit performance overview</p></div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Orders Processed" value={totalOrders.toLocaleString()} change={8.5} icon={Package} />
        <MetricCard title="Discrepancies Found" value={`${discrepancies.length} (${formatCurrency(discrepancyAmount)})`} change={12.3} icon={AlertTriangle} iconColor="text-warning" />
        <MetricCard title="Disputes Active" value={String(activeDisputes)} change={-5.2} icon={Mail} iconColor="text-primary" />
        <MetricCard title="Amount Recovered" value={`${formatCurrency(recoveredAmount)} (${recoveryRate.toFixed(0)}%)`} change={15.1} icon={IndianRupee} iconColor="text-success" />
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

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Recent Audit Logs</h2>
        <DataTable columns={columns} data={mockAuditLogs} pageSize={10} searchable searchKeys={['awb_number', 'courier']} searchPlaceholder="Search AWB or courier..." />
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Order Details — {selectedLog?.awb_number}</DialogTitle></DialogHeader>
          {selectedLog && (
            <div className="grid gap-4 sm:grid-cols-2 py-2">
              <div className="space-y-3">
                <div><p className="text-xs text-muted-foreground">Courier</p><p className="font-medium">{selectedLog.courier}</p></div>
                <div><p className="text-xs text-muted-foreground">Billed Weight</p><p className="font-medium">{selectedLog.billed_weight} kg</p></div>
                <div><p className="text-xs text-muted-foreground">Actual Weight</p><p className="font-medium">{selectedLog.actual_weight} kg</p></div>
                <div><p className="text-xs text-muted-foreground">Discrepancy</p><p className="font-medium text-destructive">₹{selectedLog.discrepancy_amount}</p></div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Timeline</p>
                {selectedLog.timeline?.map((t: any, i: number) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div><p className="text-sm font-medium">{t.event}</p><p className="text-xs text-muted-foreground">{new Date(t.date).toLocaleDateString()}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
