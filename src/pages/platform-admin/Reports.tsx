import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { Download, FileBarChart, TrendingUp, IndianRupee, Building2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { mockTenants, mockRevenueByMonth, mockCourierAnalysis, mockDiscrepancyTypes } from '@/lib/mock-data';
import { downloadCSV, formatCurrency } from '@/lib/utils';

const CHART_COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

const ordersOverTime = [
  { month: 'Mar', orders: 2200 }, { month: 'Apr', orders: 3100 }, { month: 'May', orders: 4500 },
  { month: 'Jun', orders: 5200 }, { month: 'Jul', orders: 4800 }, { month: 'Aug', orders: 6100 },
  { month: 'Sep', orders: 7200 }, { month: 'Oct', orders: 8500 }, { month: 'Nov', orders: 9100 },
  { month: 'Dec', orders: 10200 }, { month: 'Jan', orders: 11500 }, { month: 'Feb', orders: 12800 },
];

const financialSummary = [
  { month: 'Sep 25', recovered: 420000, commission: 50400, gst: 9072, net_revenue: 41328 },
  { month: 'Oct 25', recovered: 480000, commission: 57600, gst: 10368, net_revenue: 47232 },
  { month: 'Nov 25', recovered: 510000, commission: 61200, gst: 11016, net_revenue: 50184 },
  { month: 'Dec 25', recovered: 560000, commission: 67200, gst: 12096, net_revenue: 55104 },
  { month: 'Jan 26', recovered: 620000, commission: 74400, gst: 13392, net_revenue: 61008 },
  { month: 'Feb 26', recovered: 690000, commission: 82800, gst: 14904, net_revenue: 67896 },
];

export default function Reports() {
  const [dateRange, setDateRange] = useState('last_30');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground">Analytics and performance reports</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="last_7">Last 7 days</SelectItem>
            <SelectItem value="last_30">Last 30 days</SelectItem>
            <SelectItem value="this_month">This month</SelectItem>
            <SelectItem value="last_month">Last month</SelectItem>
            <SelectItem value="this_quarter">This quarter</SelectItem>
            <SelectItem value="this_year">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenant">Tenant Performance</TabsTrigger>
          <TabsTrigger value="courier">Courier Analysis</TabsTrigger>
          <TabsTrigger value="financial">Financial Summary</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard title="Total Orders" value="12,800" change={11.3} icon={FileBarChart} />
            <MetricCard title="Discrepancies Found" value="1,842" change={8.2} icon={TrendingUp} iconColor="text-warning" />
            <MetricCard title="Amount Recovered" value="₹6.90 L" change={15.1} icon={IndianRupee} iconColor="text-success" />
            <MetricCard title="Active Tenants" value="4" change={5.0} icon={Building2} />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <ChartCard title="Orders Over Time">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={ordersOverTime}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 32%, 91%)', borderRadius: '8px', fontSize: 13 }} />
                  <Line type="monotone" dataKey="orders" stroke="hsl(221, 83%, 53%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Discrepancy Types">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={mockDiscrepancyTypes} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {mockDiscrepancyTypes.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Tenant Performance */}
        <TabsContent value="tenant" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(mockTenants.map(t => ({ Company: t.name, Orders: t.orders_processed, Recovered: t.total_recovered, Commission: t.commission })), 'tenant_performance')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <DataTable
            columns={[
              { key: 'name', header: <ColumnHeader title="Tenant" tooltip="Company name of the tenant" />, sortable: true },
              { key: 'orders_processed', header: <ColumnHeader title="Orders" tooltip="Total shipments processed for this tenant" />, sortable: true, render: (r) => r.orders_processed.toLocaleString() },
              { key: 'total_recovered', header: <ColumnHeader title="Recovered" tooltip="Total amount recovered from courier overcharges" />, sortable: true, render: (r) => formatCurrency(r.total_recovered) },
              { key: 'commission', header: <ColumnHeader title="Commission %" tooltip="Platform fee percentage charged on recoveries" />, sortable: true, render: (r) => `${r.commission}%` },
            ]}
            data={mockTenants.filter(t => t.status === 'active')}
            pageSize={10}
          />
          <ChartCard title="Top Tenants by Recovery">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockTenants.filter(t => t.status === 'active').sort((a, b) => b.total_recovered - a.total_recovered)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} width={120} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="total_recovered" fill="hsl(187, 72%, 48%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        {/* Courier Analysis */}
        <TabsContent value="courier" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(mockCourierAnalysis, 'courier_analysis')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <DataTable
            columns={[
              { key: 'courier', header: <ColumnHeader title="Courier" tooltip="Courier partner name" />, sortable: true },
              { key: 'shipments', header: <ColumnHeader title="Shipments" tooltip="Total shipments handled by this courier" />, sortable: true, render: (r) => r.shipments.toLocaleString() },
              { key: 'discrepancy_rate', header: <ColumnHeader title="Discrepancy Rate" tooltip="Percentage of shipments with billing errors" />, sortable: true, render: (r) => `${r.discrepancy_rate}%` },
              { key: 'avg_overcharge', header: <ColumnHeader title="Avg Overcharge (₹)" tooltip="Average overcharge amount per discrepant shipment" />, sortable: true, render: (r) => `₹${r.avg_overcharge}` },
            ]}
            data={mockCourierAnalysis}
            pageSize={10}
          />
          <ChartCard title="Discrepancy Rate by Courier">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockCourierAnalysis}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="courier" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="discrepancy_rate" name="Discrepancy %" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        {/* Financial Summary */}
        <TabsContent value="financial" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(financialSummary, 'financial_summary')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <DataTable
            columns={[
              { key: 'month', header: <ColumnHeader title="Month" tooltip="Billing month for this financial summary" />, sortable: true },
              { key: 'recovered', header: <ColumnHeader title="Recovered" tooltip="Total amount recovered from couriers this month" />, sortable: true, render: (r) => formatCurrency(r.recovered) },
              { key: 'commission', header: <ColumnHeader title="Commission" tooltip="Platform fee earned on recovered amounts" />, sortable: true, render: (r) => formatCurrency(r.commission) },
              { key: 'gst', header: <ColumnHeader title="GST" tooltip="18% Goods and Services Tax on commission" />, render: (r) => formatCurrency(r.gst) },
              { key: 'net_revenue', header: <ColumnHeader title="Net Revenue" tooltip="Commission minus GST — actual platform revenue" />, sortable: true, render: (r) => formatCurrency(r.net_revenue) },
            ]}
            data={financialSummary}
            pageSize={10}
          />
          <ChartCard title="Revenue Trend">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={financialSummary}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Line type="monotone" dataKey="commission" name="Commission" stroke="hsl(221, 83%, 53%)" strokeWidth={2} />
                <Line type="monotone" dataKey="net_revenue" name="Net Revenue" stroke="hsl(187, 72%, 48%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
