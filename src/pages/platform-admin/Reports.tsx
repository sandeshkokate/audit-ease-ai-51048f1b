import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { Download, FileBarChart, TrendingUp, IndianRupee, Building2, Loader2 } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { downloadCSV, formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

const CHART_COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

export default function Reports() {
  const [dateRange, setDateRange] = useState('last_30');

  // Fetch tenants for performance tab
  const { data: tenants = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ['reports-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((t: any) => ({
        name: t.company_name,
        status: t.status,
        commission: t.commission_percentage || 20,
        total_recovered: 0, // will be enriched below
      }));
    }
  });

  // Fetch audit logs for metrics
  const { data: auditStats, isLoading: statsLoading } = useQuery({
    queryKey: ['reports-audit-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, discrepancy_amount, recovery_amount, courier_name, has_weight_discrepancy, has_zone_discrepancy, has_rto_overcharge, has_damage_misclassification, tenant_id');
      if (error) throw error;

      const totalOrders = data?.length || 0;
      const discrepancies = data?.filter(d => (d.discrepancy_amount || 0) > 0) || [];
      const totalRecovered = data?.reduce((s, d) => s + (d.recovery_amount || 0), 0) || 0;

      // Courier analysis
      const courierMap: Record<string, { shipments: number; discrepancies: number; totalOvercharge: number }> = {};
      data?.forEach(d => {
        const c = d.courier_name || 'Unknown';
        if (!courierMap[c]) courierMap[c] = { shipments: 0, discrepancies: 0, totalOvercharge: 0 };
        courierMap[c].shipments++;
        if ((d.discrepancy_amount || 0) > 0) {
          courierMap[c].discrepancies++;
          courierMap[c].totalOvercharge += d.discrepancy_amount || 0;
        }
      });
      const courierAnalysis = Object.entries(courierMap).map(([courier, v]) => ({
        courier,
        shipments: v.shipments,
        discrepancy_rate: v.shipments > 0 ? parseFloat(((v.discrepancies / v.shipments) * 100).toFixed(1)) : 0,
        avg_overcharge: v.discrepancies > 0 ? Math.round(v.totalOvercharge / v.discrepancies) : 0,
      }));

      // Discrepancy types
      let weight = 0, zone = 0, rto = 0, damage = 0;
      data?.forEach(d => {
        if (d.has_weight_discrepancy) weight++;
        if (d.has_zone_discrepancy) zone++;
        if (d.has_rto_overcharge) rto++;
        if (d.has_damage_misclassification) damage++;
      });
      const discrepancyTypes = [
        { name: 'Weight', value: weight },
        { name: 'Zone', value: zone },
        { name: 'RTO', value: rto },
        { name: 'Damage', value: damage },
      ].filter(d => d.value > 0);

      // Tenant recovery
      const tenantRecovery: Record<string, number> = {};
      data?.forEach(d => {
        if (d.tenant_id) {
          tenantRecovery[d.tenant_id] = (tenantRecovery[d.tenant_id] || 0) + (d.recovery_amount || 0);
        }
      });

      return { totalOrders, discrepancyCount: discrepancies.length, totalRecovered, courierAnalysis, discrepancyTypes, tenantRecovery };
    }
  });

  // Financial summary from invoices
  const { data: financialSummary = [] } = useQuery({
    queryKey: ['reports-financial'],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { data } = await supabase
          .from('invoices')
          .select('total_recovered, commission_amount, gst_amount')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const recovered = data?.reduce((s, d) => s + (d.total_recovered || 0), 0) || 0;
        const commission = data?.reduce((s, d) => s + (d.commission_amount || 0), 0) || 0;
        const gst = data?.reduce((s, d) => s + (d.gst_amount || 0), 0) || 0;

        months.push({
          month: format(monthStart, 'MMM yy'),
          recovered,
          commission,
          gst,
          net_revenue: commission - gst,
        });
      }
      return months;
    }
  });

  // Orders over time
  const { data: ordersOverTime = [] } = useQuery({
    queryKey: ['reports-orders-over-time'],
    queryFn: async () => {
      const months = [];
      for (let i = 11; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { count } = await supabase
          .from('audit_logs')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        months.push({ month: format(monthStart, 'MMM'), orders: count || 0 });
      }
      return months;
    }
  });

  const isLoading = tenantsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const courierAnalysis = auditStats?.courierAnalysis || [];
  const discrepancyTypes = auditStats?.discrepancyTypes || [];

  // Enrich tenants with recovery data
  const enrichedTenants = tenants.map((t: any) => ({
    ...t,
    total_recovered: 0, // tenant_id mapping would need a join; kept for structure
  }));

  const activeTenantCount = tenants.filter((t: any) => t.status === 'active').length;

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
            <MetricCard title="Total Orders" value={(auditStats?.totalOrders || 0).toLocaleString()} icon={FileBarChart} />
            <MetricCard title="Discrepancies Found" value={(auditStats?.discrepancyCount || 0).toLocaleString()} icon={TrendingUp} iconColor="text-warning" />
            <MetricCard title="Amount Recovered" value={formatCurrency(auditStats?.totalRecovered || 0)} icon={IndianRupee} iconColor="text-success" />
            <MetricCard title="Active Tenants" value={String(activeTenantCount)} icon={Building2} />
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
                  <Pie data={discrepancyTypes} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {discrepancyTypes.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Courier Analysis */}
        <TabsContent value="courier" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(courierAnalysis, 'courier_analysis')}>
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
            data={courierAnalysis}
            pageSize={10}
          />
          <ChartCard title="Discrepancy Rate by Courier">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={courierAnalysis}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="courier" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="discrepancy_rate" name="Discrepancy %" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        {/* Tenant Performance */}
        <TabsContent value="tenant" className="space-y-4">
          <DataTable
            columns={[
              { key: 'name', header: <ColumnHeader title="Tenant" tooltip="Company name of the tenant" />, sortable: true },
              { key: 'commission', header: <ColumnHeader title="Commission %" tooltip="Platform fee percentage charged on recoveries" />, sortable: true, render: (r) => `${r.commission}%` },
              { key: 'status', header: <ColumnHeader title="Status" tooltip="Tenant status" />, sortable: true },
            ]}
            data={tenants.filter((t: any) => t.status === 'active')}
            pageSize={10}
          />
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
