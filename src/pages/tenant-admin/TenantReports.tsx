import { useState, useMemo } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { Download, Package, TrendingUp, IndianRupee, AlertTriangle, Loader2, CheckCircle2, Target } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { downloadCSV, formatCurrency } from '@/lib/utils';
import { subDays, subMonths, startOfMonth, startOfQuarter, startOfYear, format } from 'date-fns';
import { hasActionableDiscrepancy } from '@/lib/actionable-discrepancy';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

function getStartDate(key: string): Date {
  const now = new Date();
  switch (key) {
    case 'last_7': return subDays(now, 7);
    case 'last_30': return subDays(now, 30);
    case 'this_month': return startOfMonth(now);
    case 'this_quarter': return startOfQuarter(now);
    case 'this_year': return startOfYear(now);
    default: return subDays(now, 30);
  }
}

export default function TenantReports() {
  useDocumentTitle('Reports');
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('last_30');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const startDate = useMemo(() => getStartDate(dateRange), [dateRange]);

  // Fetch tenant commission
  const { data: tenantCommission = 12 } = useQuery({
    queryKey: ['tenant-commission', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return 12;
      const { data } = await supabase
        .from('tenants')
        .select('commission_percentage')
        .eq('id', user.tenant_id)
        .single();
      return data?.commission_percentage ?? 12;
    },
    enabled: !!user?.tenant_id,
  });

  const commissionRate = tenantCommission / 100;

  // Fetch audit logs filtered by date range
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['tenant-reports-audit', user?.tenant_id, dateRange],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from('audit_logs')
        .select('courier, overcharge_amount, discrepancy_type, status, created_at, billed_value, expected_value, awb_number')
        .eq('tenant_id', user.tenant_id)
        .gte('created_at', startDate.toISOString());
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.tenant_id
  });

  // Courier analysis with extra error counts
  const courierAnalysis = useMemo(() => {
    const grouped: Record<string, { courier: string; shipments: number; discrepancies: number; total_overcharge: number; weight_errors: number; zone_errors: number; rto_errors: number }> = {};
    auditLogs.forEach(log => {
      const c = log.courier || 'Unknown';
      if (!grouped[c]) grouped[c] = { courier: c, shipments: 0, discrepancies: 0, total_overcharge: 0, weight_errors: 0, zone_errors: 0, rto_errors: 0 };
      grouped[c].shipments += 1;
      if (hasActionableDiscrepancy(log)) grouped[c].discrepancies += 1;
      grouped[c].total_overcharge += log.overcharge_amount ?? 0;
      const dtype = (log.discrepancy_type || '').toLowerCase();
      if (hasActionableDiscrepancy(log) && dtype === 'weight') grouped[c].weight_errors++;
      if (hasActionableDiscrepancy(log) && dtype === 'zone') grouped[c].zone_errors++;
      if (hasActionableDiscrepancy(log) && dtype === 'rto') grouped[c].rto_errors++;
    });
    return Object.values(grouped).map(g => ({
      ...g,
      discrepancy_rate: g.shipments ? +((g.discrepancies / g.shipments) * 100).toFixed(1) : 0,
      avg_overcharge: g.discrepancies ? Math.round(g.total_overcharge / g.discrepancies) : 0,
    }));
  }, [auditLogs]);

  // Discrepancy types with amounts
  const discrepancyTypes = useMemo(() => {
    const map: Record<string, { name: string; count: number; amount: number }> = {
      Weight: { name: 'Weight', count: 0, amount: 0 },
      Zone: { name: 'Zone', count: 0, amount: 0 },
      RTO: { name: 'RTO', count: 0, amount: 0 },
      'Rate Overcharge': { name: 'Rate Overcharge', count: 0, amount: 0 },
      Other: { name: 'Other', count: 0, amount: 0 },
    };
    auditLogs.forEach(log => {
      const amt = log.overcharge_amount ?? 0;
      if (!hasActionableDiscrepancy(log)) return;
      const dtype = (log.discrepancy_type || '').toLowerCase();
      if (dtype === 'weight') { map.Weight.count++; map.Weight.amount += amt; }
      else if (dtype === 'zone') { map.Zone.count++; map.Zone.amount += amt; }
      else if (dtype === 'rto') { map.RTO.count++; map.RTO.amount += amt; }
      else if (dtype === 'overcharge') { map['Rate Overcharge'].count++; map['Rate Overcharge'].amount += amt; }
      else { map.Other.count++; map.Other.amount += amt; }
    });
    const all = Object.values(map).filter(d => d.count > 0);
    const totalCount = all.reduce((s, d) => s + d.count, 0);
    return all.map(d => ({
      name: d.name,
      value: d.count,
      count: d.count,
      percentage: totalCount > 0 ? +((d.count / totalCount) * 100).toFixed(1) : 0,
      total_amount: d.amount,
      avg_amount: d.count > 0 ? Math.round(d.amount / d.count) : 0,
    }));
  }, [auditLogs]);

  // Audit summary by month
  const auditSummary = useMemo(() => {
    const byMonth: Record<string, { month: string; sortKey: string; orders: number; discrepancies: number; total_overcharge: number }> = {};
    auditLogs.forEach(log => {
      const d = new Date(log.created_at ?? '');
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM yyyy');
      if (!byMonth[key]) byMonth[key] = { month: label, sortKey: key, orders: 0, discrepancies: 0, total_overcharge: 0 };
      byMonth[key].orders += 1;
      if (hasActionableDiscrepancy(log)) {
        byMonth[key].discrepancies += 1;
        byMonth[key].total_overcharge += log.overcharge_amount ?? 0;
      }
    });
    return Object.values(byMonth)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6)
      .map(m => ({
        ...m,
        detection_rate: m.orders > 0 ? +((m.discrepancies / m.orders) * 100).toFixed(1) : 0,
      }));
  }, [auditLogs]);

  // Recovery tracker by month with extra columns
  const monthlyRecovery = useMemo(() => {
    const byMonth: Record<string, { month: string; sortKey: string; disputes: number; resolved: number; recovered: number; disputed_amount: number }> = {};
    auditLogs.forEach(log => {
      if (!hasActionableDiscrepancy(log)) return;
      const d = new Date(log.created_at ?? '');
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM yyyy');
      if (!byMonth[key]) byMonth[key] = { month: label, sortKey: key, disputes: 0, resolved: 0, recovered: 0, disputed_amount: 0 };
      byMonth[key].disputes += 1;
      byMonth[key].disputed_amount += log.overcharge_amount ?? 0;
      if (log.status === 'recovered') {
        byMonth[key].resolved += 1;
        byMonth[key].recovered += log.overcharge_amount ?? 0;
      }
    });
    return Object.values(byMonth)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6)
      .map(m => ({
        ...m,
        recovery_rate: m.disputes > 0 ? +((m.resolved / m.disputes) * 100).toFixed(1) : 0,
        pending_amount: m.disputed_amount - m.recovered,
      }));
  }, [auditLogs]);

  // Recovery summary metrics
  const recoverySummary = useMemo(() => {
    const disputed = auditLogs.filter(l => hasActionableDiscrepancy(l));
    const resolved = disputed.filter(l => l.status === 'recovered');
    const totalRecovered = resolved.reduce((s, l) => s + (l.overcharge_amount ?? 0), 0);
    return {
      totalDisputes: disputed.length,
      totalResolved: resolved.length,
      successRate: disputed.length > 0 ? +((resolved.length / disputed.length) * 100).toFixed(1) : 0,
      totalRecovered,
    };
  }, [auditLogs]);

  // Financial impact with real commission and extra columns
  const financialImpact = useMemo(() => {
    const byMonth: Record<string, { month: string; sortKey: string; gross_savings: number; commission: number; net_savings: number; recovery_count: number }> = {};
    auditLogs.forEach(log => {
      if (log.status !== 'recovered') return;
      const amt = log.overcharge_amount ?? 0;
      if (amt <= 0) return;
      const d = new Date(log.created_at ?? '');
      const key = format(d, 'yyyy-MM');
      const label = format(d, 'MMM yyyy');
      if (!byMonth[key]) byMonth[key] = { month: label, sortKey: key, gross_savings: 0, commission: 0, net_savings: 0, recovery_count: 0 };
      const comm = amt * commissionRate;
      byMonth[key].gross_savings += amt;
      byMonth[key].commission += comm;
      byMonth[key].net_savings += amt - comm;
      byMonth[key].recovery_count += 1;
    });
    return Object.values(byMonth)
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6);
  }, [auditLogs, commissionRate]);

  const totalOrders = auditLogs.length;
  const totalDiscrepancies = auditLogs.filter(l => hasActionableDiscrepancy(l)).length;
  const detectionRate = totalOrders ? ((totalDiscrepancies / totalOrders) * 100).toFixed(1) : '0';
  const totalGross = auditLogs.filter(l => l.status === 'recovered').reduce((s, l) => s + (l.overcharge_amount ?? 0), 0);
  const totalCommission = totalGross * commissionRate;
  const totalNet = totalGross - totalCommission;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><div className="h-7 w-24 rounded bg-muted animate-pulse" /><div className="h-4 w-40 rounded bg-muted animate-pulse mt-2" /></div>
          <div className="h-9 w-36 rounded bg-muted animate-pulse" />
        </div>
        <div className="h-10 w-full max-w-lg rounded bg-muted animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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

        {/* Audit Summary */}
        <TabsContent value="audit" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard title="Total Orders" value={totalOrders.toLocaleString()} icon={Package} />
            <MetricCard title="Discrepancies" value={totalDiscrepancies.toLocaleString()} icon={AlertTriangle} iconColor="text-warning" />
            <MetricCard title="Detection Rate" value={`${detectionRate}%`} icon={TrendingUp} />
          </div>
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
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(auditSummary.map(m => ({ Month: m.month, Total_Orders: m.orders, Discrepancies: m.discrepancies, Detection_Rate: `${m.detection_rate}%`, Total_Overcharge: m.total_overcharge })), 'audit_summary')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'month', header: <ColumnHeader title="Month" tooltip="Calendar month" />, sortable: true },
            { key: 'orders', header: <ColumnHeader title="Total Orders" tooltip="Orders processed" />, sortable: true, render: r => r.orders.toLocaleString() },
            { key: 'discrepancies', header: <ColumnHeader title="Discrepancies" tooltip="Errors found" />, sortable: true },
            { key: 'detection_rate', header: <ColumnHeader title="Detection Rate (%)" tooltip="Discrepancies as % of orders" />, sortable: true, render: r => `${r.detection_rate}%` },
            { key: 'total_overcharge', header: <ColumnHeader title="Total Overcharge (₹)" tooltip="Sum of overcharges" />, sortable: true, render: r => formatCurrency(r.total_overcharge) },
          ] as Column<any>[]} data={auditSummary} pageSize={10} />
        </TabsContent>

        {/* Courier Performance */}
        <TabsContent value="courier" className="space-y-4">
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(courierAnalysis, 'courier_performance')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'courier', header: <ColumnHeader title="Courier" tooltip="Courier partner name" />, sortable: true },
            { key: 'shipments', header: <ColumnHeader title="Shipments" tooltip="Total shipments" />, sortable: true, render: r => r.shipments.toLocaleString() },
            { key: 'discrepancy_rate', header: <ColumnHeader title="Discrepancy %" tooltip="% with errors" />, sortable: true, render: r => `${r.discrepancy_rate}%` },
            { key: 'total_overcharge', header: <ColumnHeader title="Total Overcharge (₹)" tooltip="Sum of overcharges" />, sortable: true, render: r => formatCurrency(r.total_overcharge) },
            { key: 'avg_overcharge', header: <ColumnHeader title="Avg Overcharge (₹)" tooltip="Average per discrepancy" />, sortable: true, render: r => formatCurrency(r.avg_overcharge) },
            { key: 'weight_errors', header: <ColumnHeader title="Weight Errors" tooltip="Weight discrepancy count" />, sortable: true },
            { key: 'zone_errors', header: <ColumnHeader title="Zone Errors" tooltip="Zone discrepancy count" />, sortable: true },
            { key: 'rto_errors', header: <ColumnHeader title="RTO Errors" tooltip="RTO overcharge count" />, sortable: true },
          ] as Column<any>[]} data={courierAnalysis} pageSize={10} />
          <ChartCard title="Courier Comparison">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={courierAnalysis}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="courier" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="discrepancy_rate" name="Discrepancy %" fill="hsl(187, 72%, 48%)" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        {/* Discrepancy Analysis */}
        <TabsContent value="discrepancy" className="space-y-4">
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(discrepancyTypes.map(d => ({ Type: d.name, Count: d.count, Percentage: `${d.percentage}%`, Total_Amount: d.total_amount, Avg_Amount: d.avg_amount })), 'discrepancy_types')}><Download className="h-4 w-4" /> CSV</Button></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="By Type">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={discrepancyTypes} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    style={{ cursor: 'pointer' }}
                    onClick={(data) => setSelectedType(selectedType === data.name ? null : data.name)}
                  >
                    {discrepancyTypes.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Monthly disputed vs recovered">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyRecovery}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="disputed_amount" name="Disputed (₹)" fill="hsl(38, 92%, 50%)" radius={[4,4,0,0]} />
                  <Bar dataKey="recovered" name="Recovered (₹)" fill="hsl(160, 84%, 39%)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          {selectedType && (
            <Card className="shadow-card">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{selectedType} discrepancies — detailed breakdown</p>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedType(null)}>Clear filter</Button>
                </div>
                <DataTable
                  columns={[
                    { key: 'awb', header: 'AWB', sortable: true },
                    { key: 'awb_number', header: 'AWB', sortable: true },
                    { key: 'courier', header: 'Courier', sortable: true },
                    { key: 'overcharge_amount', header: 'Amount (₹)', sortable: true, render: (r: any) => formatCurrency(r.overcharge_amount) },
                    { key: 'status', header: 'Status', render: (r: any) => <Badge variant="outline">{r.status || 'detected'}</Badge> },
                  ] as any}
                  data={auditLogs.filter(l => {
                    if (!hasActionableDiscrepancy(l)) return false;
                    const dtype = (l.discrepancy_type || '').toLowerCase();
                    if (selectedType === 'Weight') return dtype === 'weight';
                    if (selectedType === 'Zone') return dtype === 'zone';
                    if (selectedType === 'RTO') return dtype === 'rto';
                    if (selectedType === 'Rate Overcharge') return dtype === 'overcharge';
                    if (selectedType === 'Damage') return dtype === 'damage';
                    return (l.overcharge_amount ?? 0) > 0 && !['weight','zone','rto','overcharge','damage'].includes(dtype);
                  })}
                  pageSize={10}
                  searchable
                  searchKeys={['awb_number', 'courier']}
                  searchPlaceholder="Search within this type..."
                />
              </CardContent>
            </Card>
          )}
          <DataTable columns={[
            { key: 'name', header: <ColumnHeader title="Discrepancy Type" tooltip="Category of billing error" />, sortable: true },
            { key: 'count', header: <ColumnHeader title="Count" tooltip="Number of occurrences" />, sortable: true },
            { key: 'percentage', header: <ColumnHeader title="Percentage (%)" tooltip="Share of total discrepancies" />, sortable: true, render: r => `${r.percentage}%` },
            { key: 'total_amount', header: <ColumnHeader title="Total Amount (₹)" tooltip="Sum of overcharges" />, sortable: true, render: r => formatCurrency(r.total_amount) },
            { key: 'avg_amount', header: <ColumnHeader title="Avg Amount (₹)" tooltip="Average per discrepancy" />, sortable: true, render: r => formatCurrency(r.avg_amount) },
          ] as Column<any>[]} data={discrepancyTypes} pageSize={10} />
        </TabsContent>

        {/* Recovery Tracker */}
        <TabsContent value="recovery" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <MetricCard title="Total Disputes" value={recoverySummary.totalDisputes.toLocaleString()} icon={AlertTriangle} iconColor="text-warning" />
            <MetricCard title="Total Resolved" value={recoverySummary.totalResolved.toLocaleString()} icon={CheckCircle2} iconColor="text-success" />
            <MetricCard title="Success Rate" value={`${recoverySummary.successRate}%`} icon={Target} iconColor="text-primary" />
            <MetricCard title="Total Recovered" value={formatCurrency(recoverySummary.totalRecovered)} icon={IndianRupee} iconColor="text-success" />
          </div>
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(monthlyRecovery, 'recovery_tracker')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'month', header: <ColumnHeader title="Month" tooltip="Calendar month" /> },
            { key: 'disputes', header: <ColumnHeader title="Disputes" tooltip="Disputes raised" />, sortable: true },
            { key: 'resolved', header: <ColumnHeader title="Resolved" tooltip="Disputes resolved" />, sortable: true },
            { key: 'recovery_rate', header: <ColumnHeader title="Recovery Rate (%)" tooltip="% disputes resolved" />, sortable: true, render: r => `${r.recovery_rate}%` },
            { key: 'recovered', header: <ColumnHeader title="Recovered (₹)" tooltip="Amount recovered" />, sortable: true, render: r => formatCurrency(r.recovered) },
            { key: 'disputed_amount', header: <ColumnHeader title="Disputed Amount (₹)" tooltip="Total disputed" />, sortable: true, render: r => formatCurrency(r.disputed_amount) },
            { key: 'pending_amount', header: <ColumnHeader title="Pending (₹)" tooltip="Disputed minus recovered" />, sortable: true, render: r => formatCurrency(r.pending_amount) },
          ] as Column<any>[]} data={monthlyRecovery} pageSize={10} />
          <ChartCard title="Recovery Funnel">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyRecovery}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="disputes" name="Disputes" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} /><Bar dataKey="resolved" name="Resolved" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        {/* Financial Impact */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard title="Gross Savings" value={formatCurrency(totalGross)} icon={IndianRupee} iconColor="text-success" />
            <MetricCard title="Commission Paid" value={formatCurrency(totalCommission)} icon={IndianRupee} iconColor="text-warning" />
            <MetricCard title="Net Savings" value={formatCurrency(totalNet)} icon={TrendingUp} iconColor="text-primary" />
          </div>
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(financialImpact.map(m => ({ Month: m.month, Gross_Savings: m.gross_savings, Commission: m.commission, Net_Savings: m.net_savings, Recovery_Count: m.recovery_count, Commission_Rate: `${tenantCommission}%` })), 'financial_impact')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'month', header: <ColumnHeader title="Month" tooltip="Calendar month" /> },
            { key: 'recovery_count', header: <ColumnHeader title="Recovery Count" tooltip="Recovered shipments" />, sortable: true },
            { key: 'gross_savings', header: <ColumnHeader title="Gross Savings (₹)" tooltip="Total recovered" />, sortable: true, render: r => formatCurrency(r.gross_savings) },
            { key: 'commission', header: <ColumnHeader title="Commission (₹)" tooltip="Platform fee" />, render: r => formatCurrency(r.commission) },
            { key: 'commission_rate', header: <ColumnHeader title="Commission %" tooltip="Rate charged" />, render: () => `${tenantCommission}%` },
            { key: 'net_savings', header: <ColumnHeader title="Net Savings (₹)" tooltip="Gross minus commission" />, sortable: true, render: r => <span className="font-semibold text-success">{formatCurrency(r.net_savings)}</span> },
          ] as Column<any>[]} data={financialImpact} pageSize={10} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
