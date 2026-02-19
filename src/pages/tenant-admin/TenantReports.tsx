import { useState, useMemo } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ChartCard from '@/components/dashboard/ChartCard';
import MetricCard from '@/components/dashboard/MetricCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { Download, Package, TrendingUp, IndianRupee, AlertTriangle, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { downloadCSV, formatCurrency } from '@/lib/utils';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(187, 72%, 48%)', 'hsl(243, 75%, 59%)', 'hsl(38, 92%, 50%)', 'hsl(160, 84%, 39%)'];

export default function TenantReports() {
  useDocumentTitle('Reports');
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('last_30');

  // Fetch all audit logs for the tenant
  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['tenant-reports-audit', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from('audit_logs')
        .select('courier_name, discrepancy_amount, recovery_amount, has_weight_discrepancy, has_zone_discrepancy, has_rto_overcharge, has_damage_misclassification, dispute_status, created_at, billed_amount, expected_amount, recovery_date')
        .eq('tenant_id', user.tenant_id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.tenant_id
  });

  // Derived data
  const courierAnalysis = useMemo(() => {
    const grouped: Record<string, { courier: string; shipments: number; discrepancies: number; total_overcharge: number }> = {};
    auditLogs.forEach(log => {
      const c = log.courier_name || 'Unknown';
      if (!grouped[c]) grouped[c] = { courier: c, shipments: 0, discrepancies: 0, total_overcharge: 0 };
      grouped[c].shipments += 1;
      if ((log.discrepancy_amount ?? 0) > 0) grouped[c].discrepancies += 1;
      grouped[c].total_overcharge += log.discrepancy_amount ?? 0;
    });
    return Object.values(grouped).map(g => ({
      ...g,
      discrepancy_rate: g.shipments ? +((g.discrepancies / g.shipments) * 100).toFixed(1) : 0,
      avg_overcharge: g.discrepancies ? Math.round(g.total_overcharge / g.discrepancies) : 0,
    }));
  }, [auditLogs]);

  const discrepancyTypes = useMemo(() => {
    let weight = 0, zone = 0, rto = 0, damage = 0, other = 0;
    auditLogs.forEach(log => {
      if (log.has_weight_discrepancy) weight++;
      if (log.has_zone_discrepancy) zone++;
      if (log.has_rto_overcharge) rto++;
      if (log.has_damage_misclassification) damage++;
      if ((log.discrepancy_amount ?? 0) > 0 && !log.has_weight_discrepancy && !log.has_zone_discrepancy && !log.has_rto_overcharge && !log.has_damage_misclassification) other++;
    });
    return [
      { name: 'Weight', value: weight },
      { name: 'Zone', value: zone },
      { name: 'RTO', value: rto },
      { name: 'Damage', value: damage },
      { name: 'Other', value: other },
    ].filter(d => d.value > 0);
  }, [auditLogs]);

  const auditSummary = useMemo(() => {
    const byMonth: Record<string, { month: string; orders: number; discrepancies: number }> = {};
    auditLogs.forEach(log => {
      const d = new Date(log.created_at ?? '');
      const key = d.toLocaleString('en', { month: 'short', year: '2-digit' });
      if (!byMonth[key]) byMonth[key] = { month: key, orders: 0, discrepancies: 0 };
      byMonth[key].orders += 1;
      if ((log.discrepancy_amount ?? 0) > 0) byMonth[key].discrepancies += 1;
    });
    return Object.values(byMonth).slice(-6);
  }, [auditLogs]);

  const monthlyRecovery = useMemo(() => {
    const byMonth: Record<string, { month: string; disputes: number; resolved: number; recovered: number }> = {};
    auditLogs.forEach(log => {
      if (!log.dispute_status || log.dispute_status === 'no_issue') return;
      const d = new Date(log.created_at ?? '');
      const key = d.toLocaleString('en', { month: 'short', year: '2-digit' });
      if (!byMonth[key]) byMonth[key] = { month: key, disputes: 0, resolved: 0, recovered: 0 };
      byMonth[key].disputes += 1;
      if (log.dispute_status === 'recovered') {
        byMonth[key].resolved += 1;
        byMonth[key].recovered += log.recovery_amount ?? 0;
      }
    });
    return Object.values(byMonth).slice(-6);
  }, [auditLogs]);

  const financialImpact = useMemo(() => {
    const byMonth: Record<string, { month: string; gross_savings: number; commission: number; net_savings: number }> = {};
    auditLogs.forEach(log => {
      if (!log.recovery_amount) return;
      const d = new Date(log.recovery_date ?? log.created_at ?? '');
      const key = d.toLocaleString('en', { month: 'short', year: '2-digit' });
      if (!byMonth[key]) byMonth[key] = { month: key, gross_savings: 0, commission: 0, net_savings: 0 };
      const gross = log.recovery_amount ?? 0;
      const comm = gross * 0.12; // default 12% commission estimate
      byMonth[key].gross_savings += gross;
      byMonth[key].commission += comm;
      byMonth[key].net_savings += gross - comm;
    });
    return Object.values(byMonth).slice(-6);
  }, [auditLogs]);

  const totalOrders = auditLogs.length;
  const totalDiscrepancies = auditLogs.filter(l => (l.discrepancy_amount ?? 0) > 0).length;
  const detectionRate = totalOrders ? ((totalDiscrepancies / totalOrders) * 100).toFixed(1) : '0';
  const totalGross = auditLogs.reduce((s, l) => s + (l.recovery_amount ?? 0), 0);
  const totalCommission = totalGross * 0.12;
  const totalNet = totalGross - totalCommission;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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

        <TabsContent value="audit" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard title="Total Orders" value={totalOrders.toLocaleString()} icon={Package} />
            <MetricCard title="Discrepancies" value={totalDiscrepancies.toLocaleString()} icon={AlertTriangle} iconColor="text-warning" />
            <MetricCard title="Detection Rate" value={`${detectionRate}%`} icon={TrendingUp} />
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
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(courierAnalysis, 'courier_performance')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'courier', header: <ColumnHeader title="Courier" tooltip="Courier partner name" />, sortable: true },
            { key: 'shipments', header: <ColumnHeader title="Shipments" tooltip="Total shipments handled by this courier" />, sortable: true, render: r => r.shipments.toLocaleString() },
            { key: 'discrepancy_rate', header: <ColumnHeader title="Discrepancy %" tooltip="Percentage of shipments with billing errors" />, sortable: true, render: r => `${r.discrepancy_rate}%` },
            { key: 'avg_overcharge', header: <ColumnHeader title="Avg Overcharge" tooltip="Average overcharge amount per discrepant shipment" />, sortable: true, render: r => `₹${r.avg_overcharge}` },
          ]} data={courierAnalysis} pageSize={10} />
          <ChartCard title="Courier Comparison">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={courierAnalysis}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="courier" tick={{ fontSize: 11 }} /><YAxis /><Tooltip /><Bar dataKey="discrepancy_rate" name="Discrepancy %" fill="hsl(187, 72%, 48%)" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="discrepancy" className="space-y-4">
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(discrepancyTypes, 'discrepancy_types')}><Download className="h-4 w-4" /> CSV</Button></div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="By Type">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart><Pie data={discrepancyTypes} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{discrepancyTypes.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart>
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
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(monthlyRecovery, 'recovery_tracker')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'month', header: <ColumnHeader title="Month" tooltip="Calendar month for this recovery data" /> },
            { key: 'disputes', header: <ColumnHeader title="Disputes" tooltip="Number of disputes raised this month" />, sortable: true },
            { key: 'resolved', header: <ColumnHeader title="Resolved" tooltip="Number of disputes resolved (credit note received)" />, sortable: true },
            { key: 'recovered', header: <ColumnHeader title="Recovered" tooltip="Total amount recovered from couriers this month" />, sortable: true, render: r => formatCurrency(r.recovered) },
          ]} data={monthlyRecovery} pageSize={10} />
          <ChartCard title="Recovery Funnel">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyRecovery}><CartesianGrid strokeDasharray="3 3" className="stroke-border" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="disputes" name="Disputes" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} /><Bar dataKey="resolved" name="Resolved" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <MetricCard title="Gross Savings" value={formatCurrency(totalGross)} icon={IndianRupee} iconColor="text-success" />
            <MetricCard title="Commission Paid" value={formatCurrency(totalCommission)} icon={IndianRupee} iconColor="text-warning" />
            <MetricCard title="Net Savings" value={formatCurrency(totalNet)} icon={TrendingUp} iconColor="text-primary" />
          </div>
          <div className="flex justify-end"><Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(financialImpact, 'financial_impact')}><Download className="h-4 w-4" /> CSV</Button></div>
          <DataTable columns={[
            { key: 'month', header: <ColumnHeader title="Month" tooltip="Calendar month for this financial data" /> },
            { key: 'gross_savings', header: <ColumnHeader title="Gross Savings" tooltip="Total amount recovered before deducting platform commission" />, sortable: true, render: r => formatCurrency(r.gross_savings) },
            { key: 'commission', header: <ColumnHeader title="Commission" tooltip="Platform fee deducted from gross savings" />, render: r => formatCurrency(r.commission) },
            { key: 'net_savings', header: <ColumnHeader title="Net Savings" tooltip="Your actual savings = Gross Savings − Commission" />, sortable: true, render: r => <span className="font-semibold text-success">{formatCurrency(r.net_savings)}</span> },
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
