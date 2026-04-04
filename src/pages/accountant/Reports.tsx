import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '@/components/dashboard/ChartCard';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

export default function AccountantReports() {
  const { user } = useAuth();

  // Monthly recovery data
  const { data: monthlyRecovery = [], isLoading: recoveryLoading } = useQuery({
    queryKey: ['accountant-monthly-recovery', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const monthStart = startOfMonth(subMonths(new Date(), i));
        const monthEnd = endOfMonth(subMonths(new Date(), i));

        const { data } = await supabase
          .from('audit_logs')
          .select('overcharge_amount, status')
          .eq('tenant_id', user.tenant_id)
          .eq('status', 'recovered')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const recovered = data?.reduce((s, d) => s + (d.overcharge_amount || 0), 0) || 0;
        months.push({ month: format(monthStart, 'MMM'), recovered });
      }
      return months;
    },
    enabled: !!user?.tenant_id
  });

  // Courier analysis
  const { data: courierAnalysis = [], isLoading: courierLoading } = useQuery({
    queryKey: ['accountant-courier-analysis', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data } = await supabase
        .from('audit_logs')
        .select('courier, overcharge_amount')
        .eq('tenant_id', user.tenant_id);

      const courierMap: Record<string, { shipments: number; discrepancies: number; totalOvercharge: number }> = {};
      data?.forEach(d => {
        const c = d.courier || 'Unknown';
        if (!courierMap[c]) courierMap[c] = { shipments: 0, discrepancies: 0, totalOvercharge: 0 };
        courierMap[c].shipments++;
        if ((d.overcharge_amount || 0) > 1) {
          courierMap[c].discrepancies++;
          courierMap[c].totalOvercharge += d.overcharge_amount || 0;
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

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Reports</h1><p className="text-sm text-muted-foreground">Financial reports (read-only)</p></div>

      <Tabs defaultValue="recovery" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recovery">Recovery Tracker</TabsTrigger>
          <TabsTrigger value="courier">Courier Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="recovery" className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(monthlyRecovery, 'recovery_report')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <ChartCard title="Monthly Recovery">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyRecovery}>
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
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCSV(courierAnalysis, 'courier_report')}>
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </div>
          <DataTable
            columns={[
              { key: 'courier', header: <ColumnHeader title="Courier" tooltip="Courier partner name" />, sortable: true },
              { key: 'shipments', header: <ColumnHeader title="Shipments" tooltip="Total shipments handled by this courier" />, sortable: true, render: (r) => r.shipments.toLocaleString() },
              { key: 'discrepancy_rate', header: <ColumnHeader title="Discrepancy %" tooltip="Percentage of shipments with billing errors" />, sortable: true, render: (r) => `${r.discrepancy_rate}%` },
              { key: 'avg_overcharge', header: <ColumnHeader title="Avg Overcharge" tooltip="Average overcharge amount per discrepant shipment" />, render: (r) => `₹${r.avg_overcharge}` },
            ] as Column<any>[]}
            data={courierAnalysis}
            pageSize={10}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
