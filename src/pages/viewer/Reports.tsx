import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { mockMonthlyRecovery } from '@/lib/tenant-mock-data';
import { mockCourierAnalysis } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

export default function ViewerReports() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-sm text-muted-foreground">Pre-built summary reports (read-only)</p></div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Recovered (6 months)</p>
            <p className="text-2xl font-bold text-success mt-1">{formatCurrency(mockMonthlyRecovery.reduce((s, m) => s + m.recovered, 0))}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Disputes</p>
            <p className="text-2xl font-bold text-primary mt-1">{mockMonthlyRecovery.reduce((s, m) => s + m.disputes, 0)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Resolution Rate</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {((mockMonthlyRecovery.reduce((s, m) => s + m.resolved, 0) / mockMonthlyRecovery.reduce((s, m) => s + m.disputes, 0)) * 100).toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      <ChartCard title="Monthly Recovery Summary">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockMonthlyRecovery}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
            <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="recovered" name="Recovered" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Courier Performance</h2>
        <DataTable
          columns={[
            { key: 'courier', header: 'Courier', sortable: true },
            { key: 'shipments', header: 'Shipments', sortable: true, render: (r) => r.shipments.toLocaleString() },
            { key: 'discrepancy_rate', header: 'Discrepancy Rate', sortable: true, render: (r) => `${r.discrepancy_rate}%` },
            { key: 'avg_overcharge', header: 'Avg Overcharge', render: (r) => `₹${r.avg_overcharge}` },
          ] as Column<any>[]}
          data={mockCourierAnalysis}
          pageSize={10}
        />
      </div>
    </div>
  );
}
