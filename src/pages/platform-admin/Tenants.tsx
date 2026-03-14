import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatCurrency } from '@/lib/utils';
import { Pencil, CheckCircle2, Ban, Search, Loader2, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { TENANT_STATUS_LABELS, getLabel } from '@/lib/display-labels';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type TenantRow = Tables<'tenants'>;

interface TenantViewModel {
  id: string;
  name: string;
  email: string;
  status: string;
  commission: number;
  credit_balance: number;
  onboarding_date: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  suspended: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

const EMPTY_ADD_FORM = {
  company_name: '',
  contact_email: '',
  contact_person: '',
  contact_phone: '',
  gstin: '',
  subscription_plan: 'professional',
  address: '',
  city: '',
  state: '',
  pincode: '',
  commission: 12,
  status: 'active',
};

export default function Tenants() {
  const [filter, setFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [editTenant, setEditTenant] = useState<TenantViewModel | null>(null);
  const [editForm, setEditForm] = useState<Partial<TenantRow>>({});
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...EMPTY_ADD_FORM });
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tenants = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['platform-tenants-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((t: TenantRow): TenantViewModel => ({
        id: t.id,
        name: t.company_name,
        email: t.contact_email,
        status: t.status || 'pending',
        commission: t.commission_percentage || 20,
        credit_balance: t.credit_balance || 0,
        onboarding_date: t.onboarding_date ? new Date(t.onboarding_date).toLocaleDateString() : '-',
      }));
    }
  });

  const filtered = tenants.filter((t: TenantViewModel) => {
    const matchesStatus = filter === 'all' || t.status === filter;
    const matchesSearch = !searchQ || t.name.toLowerCase().includes(searchQ.toLowerCase()) || t.email.toLowerCase().includes(searchQ.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openEdit = (tenant: TenantViewModel) => {
    setEditTenant(tenant);
    setEditForm({ ...tenant });
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('tenants')
        .update({
          company_name: editForm.name,
          contact_email: editForm.email,
          status: editForm.status,
          commission_percentage: editForm.commission,
          credit_balance: editForm.credit_balance,
        })
        .eq('id', editForm.id);
      if (error) throw error;
      toast({ title: 'Tenant updated successfully' });
      setEditTenant(null);
      queryClient.invalidateQueries({ queryKey: ['platform-tenants-page'] });
    } catch (err: any) {
      // error handled via toast
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    }
  };

  const handleAdd = async () => {
    if (!addForm.company_name.trim() || !addForm.contact_email.trim()) {
      toast({ variant: 'destructive', title: 'Required fields missing', description: 'Company Name and Contact Email are required.' });
      return;
    }
    setAdding(true);
    try {
      const { error } = await supabase.from('tenants').insert({
        company_name: addForm.company_name.trim(),
        contact_email: addForm.contact_email.trim(),
        contact_person: addForm.contact_person.trim() || null,
        contact_phone: addForm.contact_phone.trim() || null,
        gstin: addForm.gstin.trim() || null,
        subscription_plan: addForm.subscription_plan,
        address: addForm.address.trim() || null,
        city: addForm.city.trim() || null,
        state: addForm.state.trim() || null,
        pincode: addForm.pincode.trim() || null,
        commission_percentage: addForm.commission,
        status: addForm.status,
        onboarding_date: new Date().toISOString(),
      });
      if (error) throw error;
      toast({ title: 'Tenant added successfully' });
      setAddOpen(false);
      setAddForm({ ...EMPTY_ADD_FORM });
      queryClient.invalidateQueries({ queryKey: ['platform-tenants-page'] });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to add tenant', description: err.message });
    } finally {
      setAdding(false);
    }
  };

  const handleApprove = async (tenant: any) => {
    try {
      const { error } = await supabase.from('tenants').update({ status: 'active' }).eq('id', tenant.id);
      if (error) throw error;
      toast({ title: `${tenant.name} approved` });
      queryClient.invalidateQueries({ queryKey: ['platform-tenants-page'] });
    } catch (err: any) {
      // error handled via toast
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    }
  };

  const handleSuspend = async (tenant: any) => {
    if (!window.confirm(`Are you sure you want to suspend ${tenant.name}?`)) return;
    try {
      const { error } = await supabase.from('tenants').update({ status: 'suspended' }).eq('id', tenant.id);
      if (error) throw error;
      toast({ title: `${tenant.name} suspended` });
      queryClient.invalidateQueries({ queryKey: ['platform-tenants-page'] });
    } catch (err: any) {
      // error handled via toast
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    }
  };

  const handleReactivate = async (tenant: any) => {
    if (!window.confirm(`Are you sure you want to reactivate ${tenant.name}?`)) return;
    try {
      const { error } = await supabase.from('tenants').update({ status: 'active' }).eq('id', tenant.id);
      if (error) throw error;
      toast({ title: `${tenant.name} reactivated` });
      queryClient.invalidateQueries({ queryKey: ['platform-tenants-page'] });
    } catch (err: any) {
      // error handled via toast
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-semibold">Failed to load data</p>
            <p className="text-sm text-muted-foreground">There was an error loading this page.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const columns: Column<TenantRow>[] = [
    { key: 'name', header: <ColumnHeader title="Company Name" tooltip="Registered company name of the tenant" />, sortable: true },
    { key: 'email', header: <ColumnHeader title="Contact Email" tooltip="Primary contact email for this tenant" /> },
    {
      key: 'status', header: <ColumnHeader title="Status" tooltip="Active (operational), Pending (awaiting approval), Suspended (temporarily disabled), Cancelled (deactivated)" />, sortable: true,
      render: (row) => (
        <Badge variant="outline" className={STATUS_COLORS[row.status] || ''}>
          {getLabel(TENANT_STATUS_LABELS, row.status)}
        </Badge>
      ),
    },
    { key: 'commission', header: <ColumnHeader title="Commission %" tooltip="Percentage of recovered amount charged as platform fee" />, sortable: true, render: (row) => `${row.commission}%` },
    { key: 'credit_balance', header: <ColumnHeader title="Credit Balance" tooltip="Prepaid balance available for the tenant" />, sortable: true, render: (row) => formatCurrency(row.credit_balance) },
    { key: 'onboarding_date', header: <ColumnHeader title="Onboarding" tooltip="Date when the tenant was onboarded to the platform" /> },
    {
      key: 'actions', header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          {row.status === 'pending' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleApprove(row)}>
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          )}
          {row.status === 'active' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleSuspend(row)}>
              <Ban className="h-4 w-4" />
            </Button>
          )}
          {row.status === 'suspended' && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleReactivate(row)}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-sm text-muted-foreground">Manage all registered companies</p>
        </div>
        <Button variant="hero" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Tenant
        </Button>
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

      {/* Add Tenant Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Company Name *</Label>
              <Input value={addForm.company_name} onChange={(e) => setAddForm({ ...addForm, company_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Contact Email *</Label>
              <Input type="email" value={addForm.contact_email} onChange={(e) => setAddForm({ ...addForm, contact_email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Contact Person</Label>
              <Input value={addForm.contact_person} onChange={(e) => setAddForm({ ...addForm, contact_person: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={addForm.contact_phone} onChange={(e) => setAddForm({ ...addForm, contact_phone: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>GSTIN</Label>
              <Input placeholder="27AABCF1234M1Z5" value={addForm.gstin} onChange={(e) => setAddForm({ ...addForm, gstin: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Subscription Plan</Label>
              <Select value={addForm.subscription_plan} onValueChange={(v) => setAddForm({ ...addForm, subscription_plan: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={addForm.address} onChange={(e) => setAddForm({ ...addForm, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={addForm.city} onChange={(e) => setAddForm({ ...addForm, city: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input value={addForm.state} onChange={(e) => setAddForm({ ...addForm, state: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input value={addForm.pincode} onChange={(e) => setAddForm({ ...addForm, pincode: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Commission: {addForm.commission}%</Label>
              <Slider value={[addForm.commission]} onValueChange={([v]) => setAddForm({ ...addForm, commission: v })} min={5} max={30} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={addForm.status} onValueChange={(v) => setAddForm({ ...addForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleAdd} disabled={adding}>
              {adding && <Loader2 className="h-4 w-4 animate-spin" />} Add Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <Label>Contact Email</Label>
              <Input type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
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
            <Button variant="hero" onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
