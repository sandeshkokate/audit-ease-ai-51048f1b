import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatCurrency } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

export default function ViewerReports() {
  const { user } = useAuth();

  // Monthly recovery data
  const { data: monthlyRecovery = [], isLoading: recoveryLoading } = useQuery({
    queryKey: ['viewer-monthly-recovery', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { data } = await supabase
          .from('audit_logs')
          .select('recovery_amount, discrepancy_amount, dispute_status')
          .eq('tenant_id', user.tenant_id)
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const recovered = data?.reduce((s, d) => s + (d.recovery_amount || 0), 0) || 0;
        const disputes = data?.filter(d => (d.discrepancy_amount || 0) > 0).length || 0;
        const resolved = data?.filter(d => d.dispute_status === 'recovered').length || 0;

        months.push({ month: format(monthStart, 'MMM'), recovered, disputes, resolved });
      }
      return months;
    },
    enabled: !!user?.tenant_id
  });

  // Courier analysis
  const { data: courierAnalysis = [], isLoading: courierLoading } = useQuery({
    queryKey: ['viewer-courier-analysis', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data } = await supabase
        .from('audit_logs')
        .select('courier_name, discrepancy_amount')
        .eq('tenant_id', user.tenant_id);

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

      return Object.entries(courierMap).map(([courier, v]) => ({
        courier,
        shipments: v.shipments,
        discrepancy_rate: v.shipments > 0 ? parseFloat(((v.discrepancies / v.shipments) * 100).toFixed(1)) : 0,
        avg_overcharge: v.discrepancies > 0 ? Math.round(v.totalOvercharge / v.discrepancies) : 0,
      }));
    },
    enabled: !!user?.tenant_id
  });

  const isLoading = recoveryLoading || courierLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalRecovered = monthlyRecovery.reduce((s, m) => s + m.recovered, 0);
  const totalDisputes = monthlyRecovery.reduce((s, m) => s + m.disputes, 0);
  const totalResolved = monthlyRecovery.reduce((s, m) => s + m.resolved, 0);
  const resolutionRate = totalDisputes > 0 ? ((totalResolved / totalDisputes) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-sm text-muted-foreground">Pre-built summary reports (read-only)</p></div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="shadow-card">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Recovered (6 months)</p>
            <p className="text-2xl font-bold text-success mt-1">{formatCurrency(totalRecovered)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Total Disputes</p>
            <p className="text-2xl font-bold text-primary mt-1">{totalDisputes}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-5 text-center">
            <p className="text-sm text-muted-foreground">Resolution Rate</p>
            <p className="text-2xl font-bold text-foreground mt-1">{resolutionRate}%</p>
          </CardContent>
        </Card>
      </div>

      <ChartCard title="Monthly Recovery Summary">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRecovery}>
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
            { key: 'courier', header: <ColumnHeader title="Courier" tooltip="Courier partner name" />, sortable: true },
            { key: 'shipments', header: <ColumnHeader title="Shipments" tooltip="Total shipments handled by this courier" />, sortable: true, render: (r) => r.shipments.toLocaleString() },
            { key: 'discrepancy_rate', header: <ColumnHeader title="Discrepancy Rate" tooltip="Percentage of shipments with billing errors" />, sortable: true, render: (r) => `${r.discrepancy_rate}%` },
            { key: 'avg_overcharge', header: <ColumnHeader title="Avg Overcharge" tooltip="Average overcharge amount per discrepant shipment" />, render: (r) => `₹${r.avg_overcharge}` },
          ] as Column<any>[]}
          data={courierAnalysis}
          pageSize={10}
        />
      </div>
    </div>
  );
}
