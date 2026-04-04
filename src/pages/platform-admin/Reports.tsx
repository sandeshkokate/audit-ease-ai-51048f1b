import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { Download, FileBarChart, TrendingUp, IndianRupee, Building2, Loader2, Target, ArrowLeft } from 'lucide-react';
import { TENANT_STATUS_LABELS, TENANT_STATUS_COLORS as STATUS_COLORS, getLabel } from '@/lib/display-labels';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { downloadCSV, formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { subDays, subMonths, startOfMonth, endOfMonth, startOfQuarter, startOfYear, format } from 'date-fns';

const CHART_COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

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
  const [searchParams] = useSearchParams();
  const [dateRange, setDateRange] = useState('last_30');
  const [pieDrillDown, setPieDrillDown] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const range = useMemo(() => getDateRange(dateRange), [dateRange]);

  // Handle ?tab= query param for drill-down from cards
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'tenant', 'courier', 'financial'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

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

  // Fetch audit logs filtered by date range — include all needed fields
  const { data: auditData = [], isLoading: statsLoading } = useQuery({
    queryKey: ['reports-audit-stats', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('id, overcharge_amount, billed_value, expected_value, courier, discrepancy_type, tenant_id, created_at, awb_number, billed_weight, billed_zone, expected_zone, status')
        .gte('created_at', range.from.toISOString())
        .lte('created_at', range.to.toISOString());
      if (error) throw error;
      return data || [];
    }
  });

  // Financial summary from invoices (always last 6 months, chronological)
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
          sortKey: format(monthStart, 'yyyy-MM'),
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

  // Discrepancy vs Recovery trend (last 6 months) — replaces "Orders Over Time"
  const { data: discVsRecoveryTrend = [] } = useQuery({
    queryKey: ['reports-disc-vs-recovery'],
    queryFn: async () => {
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { data } = await supabase
          .from('audit_logs')
          .select('discrepancy_amount, recovery_amount')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const totalDisc = data?.reduce((s, d) => s + (d.discrepancy_amount || 0), 0) || 0;
        const totalRec = data?.reduce((s, d) => s + (d.recovery_amount || 0), 0) || 0;
        const shipments = data?.length || 0;

        months.push({
          month: format(monthStart, 'MMM'),
          overcharge: totalDisc,
          recovered: totalRec,
          gap: Math.max(0, totalDisc - totalRec),
          shipments,
        });
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
    const courierMap: Record<string, { shipments: number; discrepancies: number; totalOvercharge: number; totalRecovered: number; totalBilled: number; totalExpected: number; weight: number; zone: number; rto: number }> = {};
    auditData.forEach(d => {
      const c = d.courier_name || 'Unknown';
      if (!courierMap[c]) courierMap[c] = { shipments: 0, discrepancies: 0, totalOvercharge: 0, totalRecovered: 0, totalBilled: 0, totalExpected: 0, weight: 0, zone: 0, rto: 0 };
      courierMap[c].shipments++;
      courierMap[c].totalBilled += d.billed_amount || 0;
      courierMap[c].totalExpected += d.expected_amount || 0;
      if ((d.discrepancy_amount || 0) > 0) {
        courierMap[c].discrepancies++;
        courierMap[c].totalOvercharge += d.discrepancy_amount || 0;
      }
      courierMap[c].totalRecovered += d.recovery_amount || 0;
      if (d.has_weight_discrepancy) courierMap[c].weight++;
      if (d.has_zone_discrepancy) courierMap[c].zone++;
      if (d.has_rto_overcharge) courierMap[c].rto++;
    });
    const courierAnalysis = Object.entries(courierMap).map(([courier, v]) => ({
      courier,
      shipments: v.shipments,
      total_billed: v.totalBilled,
      total_expected: v.totalExpected,
      discrepancy_rate: v.shipments > 0 ? parseFloat(((v.discrepancies / v.shipments) * 100).toFixed(1)) : 0,
      avg_overcharge: v.discrepancies > 0 ? Math.round(v.totalOvercharge / v.discrepancies) : 0,
      total_overcharge: v.totalOvercharge,
      total_recovered: v.totalRecovered,
      recovery_rate: v.totalOvercharge > 0 ? parseFloat(((v.totalRecovered / v.totalOvercharge) * 100).toFixed(1)) : 0,
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
    const tenantMap: Record<string, { orders: number; discrepancies: number; overcharge: number; recovered: number; billed: number; expected: number }> = {};
    auditData.forEach(d => {
      if (!d.tenant_id) return;
      if (!tenantMap[d.tenant_id]) tenantMap[d.tenant_id] = { orders: 0, discrepancies: 0, overcharge: 0, recovered: 0, billed: 0, expected: 0 };
      tenantMap[d.tenant_id].orders++;
      tenantMap[d.tenant_id].billed += d.billed_amount || 0;
      tenantMap[d.tenant_id].expected += d.expected_amount || 0;
      if ((d.discrepancy_amount || 0) > 0) {
        tenantMap[d.tenant_id].discrepancies++;
        tenantMap[d.tenant_id].overcharge += d.discrepancy_amount || 0;
      }
      tenantMap[d.tenant_id].recovered += d.recovery_amount || 0;
    });

    // Drill-down data for pie chart
    const drillDownMap: Record<string, any[]> = {
      Weight: auditData.filter(d => d.has_weight_discrepancy),
      Zone: auditData.filter(d => d.has_zone_discrepancy),
      RTO: auditData.filter(d => d.has_rto_overcharge),
      Damage: auditData.filter(d => d.has_damage_misclassification),
    };

    return { totalOrders, discrepancyCount: discrepancies.length, totalOvercharge, totalRecovered, detectionRate, courierAnalysis, discrepancyTypes, tenantMap, drillDownMap };
  }, [auditData]);

  // Enrich tenants with audit stats
  const enrichedTenants = useMemo(() => {
    return tenantsRaw.map(t => {
      const s = stats.tenantMap[t.id] || { orders: 0, discrepancies: 0, overcharge: 0, recovered: 0, billed: 0, expected: 0 };
      const commission = t.commission_percentage || 20;
      const discrepancyRate = s.orders > 0 ? parseFloat(((s.discrepancies / s.orders) * 100).toFixed(1)) : 0;
      return {
        name: t.company_name,
        status: t.status || 'pending',
        commission,
        total_orders: s.orders,
        total_billed: s.billed,
        total_expected: s.expected,
        discrepancies_found: s.discrepancies,
        discrepancy_rate: discrepancyRate,
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><div className="h-7 w-20 rounded bg-muted animate-pulse" /><div className="h-4 w-48 rounded bg-muted animate-pulse mt-2" /></div>
          <div className="h-10 w-36 rounded bg-muted animate-pulse" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-3">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-7 w-24 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-[260px] w-full rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  // Drill-down columns for pie chart
  const drillDownColumns: Column<any>[] = [
    { key: 'order_id', header: 'Order ID', sortable: true },
    { key: 'awb', header: 'AWB', render: (r) => r.awb || '-' },
    { key: 'courier_name', header: 'Courier', sortable: true, render: (r) => r.courier_name || '-' },
    { key: 'charged_weight', header: 'Charged Wt', sortable: true, render: (r) => r.charged_weight ? `${r.charged_weight} kg` : '-' },
    { key: 'billed_amount', header: 'Billed (₹)', sortable: true, render: (r) => formatCurrency(r.billed_amount || 0) },
    { key: 'expected_amount', header: 'Expected (₹)', sortable: true, render: (r) => formatCurrency(r.expected_amount || 0) },
    { key: 'discrepancy_amount', header: 'Overcharge (₹)', sortable: true, render: (r) => formatCurrency(r.discrepancy_amount || 0) },
    { key: 'recovery_amount', header: 'Recovered (₹)', sortable: true, render: (r) => formatCurrency(r.recovery_amount || 0) },
  ];

  const tenantColumns: Column<any>[] = [
    { key: 'name', header: <ColumnHeader title="Tenant" tooltip="Company name" />, sortable: true },
    { key: 'status', header: <ColumnHeader title="Status" tooltip="Tenant status" />, sortable: true, render: (r) => (
      <Badge variant="outline" className={STATUS_COLORS[r.status] || ''}>{getLabel(TENANT_STATUS_LABELS, r.status)}</Badge>
    )},
    { key: 'total_orders', header: <ColumnHeader title="Total Orders" tooltip="Total shipments audited in selected period" />, sortable: true, render: (r) => r.total_orders.toLocaleString() },
    { key: 'total_billed', header: <ColumnHeader title="Billed (₹)" tooltip="Sum of amounts billed by couriers" />, sortable: true, render: (r) => formatCurrency(r.total_billed) },
    { key: 'total_expected', header: <ColumnHeader title="Expected (₹)" tooltip="Sum of expected amounts per rate card" />, sortable: true, render: (r) => formatCurrency(r.total_expected) },
    { key: 'discrepancies_found', header: <ColumnHeader title="Discrepancies" tooltip="Count of shipments with billing errors" />, sortable: true, render: (r) => r.discrepancies_found.toLocaleString() },
    { key: 'discrepancy_rate', header: <ColumnHeader title="Disc. Rate" tooltip="Discrepancies as % of total orders" />, sortable: true, render: (r) => `${r.discrepancy_rate}%` },
    { key: 'total_overcharge', header: <ColumnHeader title="Overcharge (₹)" tooltip="Total overcharge = Billed − Expected for discrepant shipments" />, sortable: true, render: (r) => formatCurrency(r.total_overcharge) },
    { key: 'amount_recovered', header: <ColumnHeader title="Recovered (₹)" tooltip="Amount actually recovered from couriers" />, sortable: true, render: (r) => formatCurrency(r.amount_recovered) },
    { key: 'recovery_rate', header: <ColumnHeader title="Recovery %" tooltip="Recovered ÷ Overcharge × 100" />, sortable: true, render: (r) => `${r.recovery_rate}%` },
    { key: 'commission_earned', header: <ColumnHeader title="Commission (₹)" tooltip="Platform fee = Recovered × Commission% ÷ 100" />, sortable: true, render: (r) => formatCurrency(r.commission_earned) },
  ];

  const courierColumns: Column<any>[] = [
    { key: 'courier', header: <ColumnHeader title="Courier" tooltip="Courier partner name" />, sortable: true },
    { key: 'shipments', header: <ColumnHeader title="Shipments" tooltip="Total shipments processed" />, sortable: true, render: (r) => r.shipments.toLocaleString() },
    { key: 'total_billed', header: <ColumnHeader title="Billed (₹)" tooltip="Total amount billed by courier" />, sortable: true, render: (r) => formatCurrency(r.total_billed) },
    { key: 'total_expected', header: <ColumnHeader title="Expected (₹)" tooltip="Total expected per rate card" />, sortable: true, render: (r) => formatCurrency(r.total_expected) },
    { key: 'discrepancy_rate', header: <ColumnHeader title="Disc. Rate" tooltip="% of shipments with billing errors" />, sortable: true, render: (r) => `${r.discrepancy_rate}%` },
    { key: 'total_overcharge', header: <ColumnHeader title="Overcharge (₹)" tooltip="Total overcharge amount" />, sortable: true, render: (r) => formatCurrency(r.total_overcharge) },
    { key: 'avg_overcharge', header: <ColumnHeader title="Avg Overcharge (₹)" tooltip="Average overcharge per discrepant shipment" />, sortable: true, render: (r) => formatCurrency(r.avg_overcharge) },
    { key: 'total_recovered', header: <ColumnHeader title="Recovered (₹)" tooltip="Amount recovered from this courier" />, sortable: true, render: (r) => formatCurrency(r.total_recovered) },
    { key: 'recovery_rate', header: <ColumnHeader title="Recovery %" tooltip="Recovered ÷ Overcharge × 100" />, sortable: true, render: (r) => `${r.recovery_rate}%` },
    { key: 'weight_errors', header: <ColumnHeader title="Weight" tooltip="Weight discrepancy count" />, sortable: true },
    { key: 'zone_errors', header: <ColumnHeader title="Zone" tooltip="Zone discrepancy count" />, sortable: true },
    { key: 'rto_errors', header: <ColumnHeader title="RTO" tooltip="RTO overcharge count" />, sortable: true },
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

  // Handle pie chart click
  const handlePieClick = (data: any) => {
    if (data?.name) {
      setPieDrillDown(data.name);
    }
  };

  return (
    <div className="space-y-4">
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tenant">Tenant Performance</TabsTrigger>
          <TabsTrigger value="courier">Courier Analysis</TabsTrigger>
          <TabsTrigger value="financial">Financial Summary</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard title="Total Orders" value={(stats.totalOrders).toLocaleString()} icon={FileBarChart} onClick={() => setActiveTab('courier')} />
            <MetricCard title="Discrepancies Found" value={(stats.discrepancyCount).toLocaleString()} icon={TrendingUp} iconColor="text-warning" onClick={() => setActiveTab('courier')} />
            <MetricCard title="Detection Rate" value={`${stats.detectionRate}%`} icon={Target} iconColor="text-primary" onClick={() => setActiveTab('tenant')} />
            <MetricCard title="Amount Recovered" value={formatCurrency(stats.totalRecovered)} icon={IndianRupee} iconColor="text-success" onClick={() => setActiveTab('financial')} />
            <MetricCard title="Active Tenants" value={String(activeTenantCount)} icon={Building2} />
          </div>

          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {/* Replaced "Orders Over Time" with Overcharge vs Recovery Trend */}
            <ChartCard title="Overcharge vs Recovery Trend">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={discVsRecoveryTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 32%, 91%)', borderRadius: '8px', fontSize: 13 }} formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="overcharge" name="Overcharge" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recovered" name="Recovered" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gap" name="Unrecovered" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Pie chart with click drill-down */}
            <ChartCard title="Discrepancy Types (click a slice for details)">
              {pieDrillDown ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setPieDrillDown(null)} className="gap-1">
                      <ArrowLeft className="h-4 w-4" /> Back to chart
                    </Button>
                    <span className="text-sm font-semibold">{pieDrillDown} Discrepancies — {stats.drillDownMap[pieDrillDown]?.length || 0} records</span>
                  </div>
                  <DataTable columns={drillDownColumns} data={stats.drillDownMap[pieDrillDown] || []} pageSize={5} />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={stats.discrepancyTypes}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      onClick={handlePieClick}
                      cursor="pointer"
                    >
                      {stats.discrepancyTypes.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
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
              <BarChart data={financialSummary}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="commission" name="Commission" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net_revenue" name="Net Revenue" fill="hsl(187, 72%, 48%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
