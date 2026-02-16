import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { mockMonthlyRecovery } from '@/lib/tenant-mock-data';
import { mockCourierAnalysis } from '@/lib/mock-data';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function AccountantReports() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-sm text-muted-foreground">Financial reports (read-only)</p></div>

      <Tabs defaultValue="recovery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recovery">Recovery Tracker</TabsTrigger>
          <TabsTrigger value="courier">Courier Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="recovery" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(mockMonthlyRecovery, 'recovery_report')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <ChartCard title="Monthly Recovery">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockMonthlyRecovery}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="recovered" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="courier" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(mockCourierAnalysis, 'courier_report')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <DataTable
            columns={[
              { key: 'courier', header: 'Courier', sortable: true },
              { key: 'shipments', header: 'Shipments', sortable: true, render: (r) => r.shipments.toLocaleString() },
              { key: 'discrepancy_rate', header: 'Discrepancy %', sortable: true, render: (r) => `${r.discrepancy_rate}%` },
              { key: 'avg_overcharge', header: 'Avg Overcharge', render: (r) => `₹${r.avg_overcharge}` },
            ] as Column<any>[]}
            data={mockCourierAnalysis}
            pageSize={10}
          />
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(mockMonthlyRecovery, 'financial_report')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <ChartCard title="Recovery Trend">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockMonthlyRecovery}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="recovered" stroke="hsl(221, 83%, 53%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
