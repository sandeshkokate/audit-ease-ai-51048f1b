import { useState } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import { Download, Package, TrendingUp, IndianRupee, AlertTriangle } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { mockCourierAnalysis, mockDiscrepancyTypes } from '@/lib/mock-data';
import { mockMonthlyRecovery } from '@/lib/tenant-mock-data';
import { downloadCSV, formatCurrency } from '@/lib/utils';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

const auditSummary = [
  { month: 'Sep', orders: 820, discrepancies: 115 }, { month: 'Oct', orders: 950, discrepancies: 138 },
  { month: 'Nov', orders: 1020, discrepancies: 145 }, { month: 'Dec', orders: 1180, discrepancies: 168 },
  { month: 'Jan', orders: 1350, discrepancies: 185 }, { month: 'Feb', orders: 1520, discrepancies: 210 },
];

const financialImpact = [
  { month: 'Sep', gross_savings: 120000, commission: 14400, net_savings: 105600 },
  { month: 'Oct', gross_savings: 155000, commission: 18600, net_savings: 136400 },
  { month: 'Nov', gross_savings: 180000, commission: 21600, net_savings: 158400 },
  { month: 'Dec', gross_savings: 210000, commission: 25200, net_savings: 184800 },
  { month: 'Jan', gross_savings: 245000, commission: 29400, net_savings: 215600 },
  { month: 'Feb', gross_savings: 285000, commission: 34200, net_savings: 250800 },
];

export default function TenantReports() {
  useDocumentTitle('Reports');
  const [dateRange, setDateRange] = useState('last_30');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-sm text-muted-foreground">Detailed analytics and insights</p></div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7">Last 7 days</SelectItem><SelectItem value="last_30">Last 30 days</SelectItem>
            <SelectItem value="this_month">This month</SelectItem><SelectItem value="this_quarter">This quarter</SelectItem>
            <SelectItem value="this_year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList className="bg-muted/50 flex-wrap">
          <TabsTrigger value="audit">Audit Summary</TabsTrigger>
          <TabsTrigger value="courier">Courier Performance</TabsTrigger>
          <TabsTrigger value="discrepancy">Discrepancy Analysis</TabsTrigger>
          <TabsTrigger value="recovery">Recovery Tracker</TabsTrigger>
          <TabsTrigger value="financial">Financial Impact</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard title="Total Orders" value="6,840" change={13.2} icon={Package} />
            <MetricCard title="Discrepancies" value="961" change={9.8} icon={AlertTriangle} iconColor="text-warning" />
            <MetricCard title="Detection Rate" value="14.1%" change={1.2} icon={TrendingUp} />
          </div>
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(auditSummary, 'audit_summary')}><Download className="h-4 w-4" /> CSV</Button></div>
          <ChartCard title="Orders vs Discrepancies">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={auditSummary}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip /><Legend />
                <Bar dataKey="orders" name="Orders" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="discrepancies" name="Discrepancies" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="courier" className="space-y-4">
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(mockCourierAnalysis, 'courier_performance')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'courier', header: 'Courier', sortable: true },
            { key: 'shipments', header: 'Shipments', sortable: true, render: r => r.shipments.toLocaleString() },
            { key: 'discrepancy_rate', header: 'Discrepancy %', sortable: true, render: r => `${r.discrepancy_rate}%` },
            { key: 'avg_overcharge', header: 'Avg Overcharge', sortable: true, render: r => `₹${r.avg_overcharge}` },
          ]} data={mockCourierAnalysis} pageSize={10} />
          <ChartCard title="Courier Comparison">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockCourierAnalysis}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="courier" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="discrepancy_rate" name="Discrepancy %" fill="hsl(187, 72%, 48%)" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="discrepancy" className="space-y-4">
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(mockDiscrepancyTypes, 'discrepancy_types')}><Download className="h-4 w-4" /> CSV</Button></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="By Type">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart><Pie data={mockDiscrepancyTypes} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{mockDiscrepancyTypes.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Trend">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={auditSummary}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="discrepancies" stroke="hsl(221, 83%, 53%)" strokeWidth={2} /></LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(mockMonthlyRecovery, 'recovery_tracker')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'month', header: 'Month' },
            { key: 'disputes', header: 'Disputes', sortable: true },
            { key: 'resolved', header: 'Resolved', sortable: true },
            { key: 'recovered', header: 'Recovered', sortable: true, render: r => formatCurrency(r.recovered) },
          ]} data={mockMonthlyRecovery} pageSize={10} />
          <ChartCard title="Recovery Funnel">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockMonthlyRecovery}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="disputes" name="Disputes" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} /><Bar dataKey="resolved" name="Resolved" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard title="Gross Savings" value={formatCurrency(1195000)} change={18.2} icon={IndianRupee} iconColor="text-success" />
            <MetricCard title="Commission Paid" value={formatCurrency(143400)} icon={IndianRupee} iconColor="text-warning" />
            <MetricCard title="Net Savings" value={formatCurrency(1051600)} change={17.8} icon={TrendingUp} iconColor="text-primary" />
          </div>
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(financialImpact, 'financial_impact')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'month', header: 'Month' },
            { key: 'gross_savings', header: 'Gross Savings', sortable: true, render: r => formatCurrency(r.gross_savings) },
            { key: 'commission', header: 'Commission', render: r => formatCurrency(r.commission) },
            { key: 'net_savings', header: 'Net Savings', sortable: true, render: r => <span className="font-semibold text-success">{formatCurrency(r.net_savings)}</span> },
          ]} data={financialImpact} pageSize={10} />
          <ChartCard title="Savings Trend">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={financialImpact}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="month" /><YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} /><Tooltip formatter={(v: number) => formatCurrency(v)} /><Legend /><Line type="monotone" dataKey="gross_savings" name="Gross" stroke="hsl(221, 83%, 53%)" strokeWidth={2} /><Line type="monotone" dataKey="net_savings" name="Net" stroke="hsl(160, 84%, 39%)" strokeWidth={2} /></LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
