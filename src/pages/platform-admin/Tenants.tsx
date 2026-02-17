import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { mockTenants } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import { Pencil, CheckCircle2, Ban, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

export default function Tenants() {
  const [filter, setFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [editTenant, setEditTenant] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const { toast } = useToast();

  const filtered = mockTenants.filter((t) => {
    const matchesStatus = filter === 'all' || t.status === filter;
    const matchesSearch = !searchQ || t.name.toLowerCase().includes(searchQ.toLowerCase()) || t.email.toLowerCase().includes(searchQ.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openEdit = (tenant: any) => {
    setEditTenant(tenant);
    setEditForm({ ...tenant });
  };

  const columns: Column<any>[] = [
    { key: 'name', header: <ColumnHeader title="Company Name" tooltip="Registered company name of the tenant" />, sortable: true },
    { key: 'email', header: <ColumnHeader title="Contact Email" tooltip="Primary contact email for this tenant" /> },
    {
      key: 'status', header: <ColumnHeader title="Status" tooltip="Active (operational), Pending (awaiting approval), Suspended (temporarily disabled), Cancelled (deactivated)" />, sortable: true,
      render: (row) => (
        <Badge variant="outline" className={STATUS_COLORS[row.status] || ''}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    { key: 'commission', header: <ColumnHeader title="Commission %" tooltip="Percentage of recovered amount charged as platform fee" />, sortable: true, render: (row) => `${row.commission}%` },
    { key: 'credit_balance', header: <ColumnHeader title="Credit Balance" tooltip="Prepaid balance available for the tenant" />, sortable: true, render: (row) => formatCurrency(row.credit_balance) },
    { key: 'orders_processed', header: <ColumnHeader title="Orders" tooltip="Total number of shipments processed through the platform" />, sortable: true, render: (row) => row.orders_processed.toLocaleString() },
    { key: 'total_recovered', header: <ColumnHeader title="Recovered" tooltip="Total amount recovered from courier overcharges" />, sortable: true, render: (row) => formatCurrency(row.total_recovered) },
    { key: 'onboarding_date', header: <ColumnHeader title="Onboarding" tooltip="Date when the tenant was onboarded to the platform" /> },
    {
      key: 'actions', header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 'pending' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => toast({ title: `${row.name} approved` })}>
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {row.status === 'active' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => toast({ title: `${row.name} suspended` })}>
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
        <p className="text-sm text-muted-foreground">Manage all registered companies</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={10} />

      {/* Edit Modal */}
      <Dialog open={!!editTenant} onOpenChange={() => setEditTenant(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.status || ''} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Commission: {editForm.commission || 10}%</Label>
              <Slider
                value={[editForm.commission || 10]}
                onValueChange={([v]) => setEditForm({ ...editForm, commission: v })}
                min={5} max={30} step={1}
              />
            </div>
            <div className="space-y-2">
              <Label>Credit Balance (₹)</Label>
              <Input type="number" value={editForm.credit_balance || 0} onChange={(e) => setEditForm({ ...editForm, credit_balance: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTenant(null)}>Cancel</Button>
            <Button variant="hero" onClick={() => { setEditTenant(null); toast({ title: 'Tenant updated successfully' }); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
