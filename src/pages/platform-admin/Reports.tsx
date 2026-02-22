import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { Download, FileBarChart, TrendingUp, IndianRupee, Building2, Loader2, Target } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { downloadCSV, formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { subDays, subMonths, startOfMonth, endOfMonth, startOfQuarter, startOfYear, format } from 'date-fns';

const CHART_COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

function getDateRange(key: string): { from: Date; to: Date } {
  const now = new Date();
  const to = now;
  switch (key) {
    case 'last_7': return { from: subDays(now, 7), to };
    case 'last_30': return { from: subDays(now, 30), to };
    case 'this_month': return { from: startOfMonth(now), to };
    case 'last_month': {
      const prev = subMonths(now, 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    }
    case 'this_quarter': return { from: startOfQuarter(now), to };
    case 'this_year': return { from: startOfYear(now), to };
    default: return { from: subDays(now, 30), to };
  }
}

export default function Reports() {
  const [dateRange, setDateRange] = useState('last_30');
  const range = useMemo(() => getDateRange(dateRange), [dateRange]);

  // Fetch tenants
  const { data: tenantsRaw = [], isLoading: tenantsLoading } = useQuery({
    queryKey: ['reports-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, company_name, status, commission_percentage')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch audit logs filtered by date range
  const { data: auditData = [], isLoading: statsLoading } = useQuery({
    queryKey: ['reports-audit-stats', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, discrepancy_amount, recovery_amount, courier_name, has_weight_discrepancy, has_zone_discrepancy, has_rto_overcharge, has_damage_misclassification, tenant_id, created_at')
        .gte('created_at', range.from.toISOString())
        .lte('created_at', range.to.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Financial summary from invoices (always last 6 months)
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

        const count = data?.length || 0;
        const recovered = data?.reduce((s, d) => s + (d.total_recovered || 0), 0) || 0;
        const commission = data?.reduce((s, d) => s + (d.commission_amount || 0), 0) || 0;
        const gst = data?.reduce((s, d) => s + (d.gst_amount || 0), 0) || 0;

        months.push({
          month: format(monthStart, 'MMM yyyy'),
          invoice_count: count,
          recovered,
          commission,
          gst,
          net_revenue: commission - gst,
          avg_recovery: count > 0 ? Math.round(recovered / count) : 0,
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

  // Compute derived stats
  const stats = useMemo(() => {
    const totalOrders = auditData.length;
    const discrepancies = auditData.filter(d => (d.discrepancy_amount || 0) > 0);
    const totalOvercharge = discrepancies.reduce((s, d) => s + (d.discrepancy_amount || 0), 0);
    const totalRecovered = auditData.reduce((s, d) => s + (d.recovery_amount || 0), 0);
    const detectionRate = totalOrders > 0 ? parseFloat(((discrepancies.length / totalOrders) * 100).toFixed(1)) : 0;

    // Courier analysis
    const courierMap: Record<string, { shipments: number; discrepancies: number; totalOvercharge: number; weight: number; zone: number; rto: number }> = {};
    auditData.forEach(d => {
      const c = d.courier_name || 'Unknown';
      if (!courierMap[c]) courierMap[c] = { shipments: 0, discrepancies: 0, totalOvercharge: 0, weight: 0, zone: 0, rto: 0 };
      courierMap[c].shipments++;
      if ((d.discrepancy_amount || 0) > 0) {
        courierMap[c].discrepancies++;
        courierMap[c].totalOvercharge += d.discrepancy_amount || 0;
      }
      if (d.has_weight_discrepancy) courierMap[c].weight++;
      if (d.has_zone_discrepancy) courierMap[c].zone++;
      if (d.has_rto_overcharge) courierMap[c].rto++;
    });
    const courierAnalysis = Object.entries(courierMap).map(([courier, v]) => ({
      courier,
      shipments: v.shipments,
      discrepancy_rate: v.shipments > 0 ? parseFloat(((v.discrepancies / v.shipments) * 100).toFixed(1)) : 0,
      avg_overcharge: v.discrepancies > 0 ? Math.round(v.totalOvercharge / v.discrepancies) : 0,
      total_overcharge: v.totalOvercharge,
      weight_errors: v.weight,
      zone_errors: v.zone,
      rto_errors: v.rto,
    }));

    // Discrepancy types for pie chart
    let weight = 0, zone = 0, rto = 0, damage = 0;
    auditData.forEach(d => {
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

    // Per-tenant stats
    const tenantMap: Record<string, { orders: number; discrepancies: number; overcharge: number; recovered: number }> = {};
    auditData.forEach(d => {
      if (!d.tenant_id) return;
      if (!tenantMap[d.tenant_id]) tenantMap[d.tenant_id] = { orders: 0, discrepancies: 0, overcharge: 0, recovered: 0 };
      tenantMap[d.tenant_id].orders++;
      if ((d.discrepancy_amount || 0) > 0) {
        tenantMap[d.tenant_id].discrepancies++;
        tenantMap[d.tenant_id].overcharge += d.discrepancy_amount || 0;
      }
      tenantMap[d.tenant_id].recovered += d.recovery_amount || 0;
    });

    return { totalOrders, discrepancyCount: discrepancies.length, totalOvercharge, totalRecovered, detectionRate, courierAnalysis, discrepancyTypes, tenantMap };
  }, [auditData]);

  // Enrich tenants with audit stats
  const enrichedTenants = useMemo(() => {
    return tenantsRaw.map(t => {
      const s = stats.tenantMap[t.id] || { orders: 0, discrepancies: 0, overcharge: 0, recovered: 0 };
      const commission = t.commission_percentage || 20;
      return {
        name: t.company_name,
        status: t.status || 'pending',
        commission,
        total_orders: s.orders,
        discrepancies_found: s.discrepancies,
        total_overcharge: s.overcharge,
        amount_recovered: s.recovered,
        recovery_rate: s.overcharge > 0 ? parseFloat(((s.recovered / s.overcharge) * 100).toFixed(1)) : 0,
        commission_earned: Math.round(s.recovered * commission / 100),
      };
    });
  }, [tenantsRaw, stats]);

  const activeTenantCount = tenantsRaw.filter(t => t.status === 'active').length;
  const isLoading = tenantsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tenantColumns: Column<any>[] = [
    { key: 'name', header: <ColumnHeader title="Tenant" tooltip="Company name" />, sortable: true },
    { key: 'status', header: <ColumnHeader title="Status" tooltip="Tenant status" />, sortable: true, render: (r) => (
      <Badge variant="outline" className={STATUS_COLORS[r.status] || ''}>{r.status.charAt(0).toUpperCase() + r.status.slice(1)}</Badge>
    )},
    { key: 'total_orders', header: <ColumnHeader title="Total Orders" tooltip="Orders processed in selected period" />, sortable: true, render: (r) => r.total_orders.toLocaleString() },
    { key: 'discrepancies_found', header: <ColumnHeader title="Discrepancies" tooltip="Billing errors detected" />, sortable: true, render: (r) => r.discrepancies_found.toLocaleString() },
    { key: 'total_overcharge', header: <ColumnHeader title="Total Overcharge (₹)" tooltip="Sum of all overcharge amounts" />, sortable: true, render: (r) => formatCurrency(r.total_overcharge) },
    { key: 'amount_recovered', header: <ColumnHeader title="Recovered (₹)" tooltip="Amount recovered from couriers" />, sortable: true, render: (r) => formatCurrency(r.amount_recovered) },
    { key: 'recovery_rate', header: <ColumnHeader title="Recovery %" tooltip="Recovery as % of overcharge" />, sortable: true, render: (r) => `${r.recovery_rate}%` },
    { key: 'commission_earned', header: <ColumnHeader title="Commission (₹)" tooltip="Platform fee earned on recoveries" />, sortable: true, render: (r) => formatCurrency(r.commission_earned) },
  ];

  const courierColumns: Column<any>[] = [
    { key: 'courier', header: <ColumnHeader title="Courier" tooltip="Courier partner name" />, sortable: true },
    { key: 'shipments', header: <ColumnHeader title="Shipments" tooltip="Total shipments" />, sortable: true, render: (r) => r.shipments.toLocaleString() },
    { key: 'discrepancy_rate', header: <ColumnHeader title="Discrepancy Rate" tooltip="% shipments with errors" />, sortable: true, render: (r) => `${r.discrepancy_rate}%` },
    { key: 'total_overcharge', header: <ColumnHeader title="Total Overcharge (₹)" tooltip="Sum of overcharges" />, sortable: true, render: (r) => formatCurrency(r.total_overcharge) },
    { key: 'avg_overcharge', header: <ColumnHeader title="Avg Overcharge (₹)" tooltip="Average per discrepant shipment" />, sortable: true, render: (r) => formatCurrency(r.avg_overcharge) },
    { key: 'weight_errors', header: <ColumnHeader title="Weight Errors" tooltip="Weight discrepancy count" />, sortable: true },
    { key: 'zone_errors', header: <ColumnHeader title="Zone Errors" tooltip="Zone discrepancy count" />, sortable: true },
    { key: 'rto_errors', header: <ColumnHeader title="RTO Errors" tooltip="RTO overcharge count" />, sortable: true },
  ];

  const financialColumns: Column<any>[] = [
    { key: 'month', header: <ColumnHeader title="Month" tooltip="Billing month" />, sortable: true },
    { key: 'invoice_count', header: <ColumnHeader title="Total Invoices" tooltip="Number of invoices generated" />, sortable: true },
    { key: 'recovered', header: <ColumnHeader title="Recovered (₹)" tooltip="Total recovered" />, sortable: true, render: (r) => formatCurrency(r.recovered) },
    { key: 'avg_recovery', header: <ColumnHeader title="Avg Recovery/Invoice" tooltip="Average recovery per invoice" />, sortable: true, render: (r) => formatCurrency(r.avg_recovery) },
    { key: 'commission', header: <ColumnHeader title="Commission (₹)" tooltip="Platform fee" />, sortable: true, render: (r) => formatCurrency(r.commission) },
    { key: 'gst', header: <ColumnHeader title="GST (₹)" tooltip="18% GST on commission" />, render: (r) => formatCurrency(r.gst) },
    { key: 'net_revenue', header: <ColumnHeader title="Net Revenue (₹)" tooltip="Commission minus GST" />, sortable: true, render: (r) => formatCurrency(r.net_revenue) },
  ];

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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard title="Total Orders" value={(stats.totalOrders).toLocaleString()} icon={FileBarChart} />
            <MetricCard title="Discrepancies Found" value={(stats.discrepancyCount).toLocaleString()} icon={TrendingUp} iconColor="text-warning" />
            <MetricCard title="Detection Rate" value={`${stats.detectionRate}%`} icon={Target} iconColor="text-primary" />
            <MetricCard title="Amount Recovered" value={formatCurrency(stats.totalRecovered)} icon={IndianRupee} iconColor="text-success" />
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
                  <Pie data={stats.discrepancyTypes} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {stats.discrepancyTypes.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
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
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(stats.courierAnalysis, 'courier_analysis')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <DataTable columns={courierColumns} data={stats.courierAnalysis} pageSize={10} />
          <ChartCard title="Discrepancy Rate by Courier">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.courierAnalysis}>
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
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(enrichedTenants, 'tenant_performance')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <DataTable columns={tenantColumns} data={enrichedTenants} pageSize={10} />
        </TabsContent>

        {/* Financial Summary */}
        <TabsContent value="financial" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(financialSummary, 'financial_summary')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <DataTable columns={financialColumns} data={financialSummary} pageSize={10} />
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
