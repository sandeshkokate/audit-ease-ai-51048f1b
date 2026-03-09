import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, UserX, UserCheck, Loader2, AlertTriangle, Plus, Search } from 'lucide-react';
import { ROLE_LABELS, getLabel } from '@/lib/display-labels';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ROLE_COLORS: Record<string, string> = {
  platform_admin: 'bg-primary/10 text-primary border-primary/20',
  tenant_admin: 'bg-accent/10 text-accent border-accent/20',
  accountant: 'bg-warning/10 text-warning border-warning/20',
  , setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<{ full_name: string; role: string; is_active: string }>({ full_name: '', role: '', is_active: 'true' });
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: '', email: '', role: 'viewer', tenant_id: '' });
  const [adding, setAdding] accountanttate(false);
  const { toast } = useToast();
accountantt queryClient = useQueryClient();

  const { accountantusers = [], isLoading, isError, refetch } = uaccountanty({
    queryKey: ['platform-users-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*, tenants:tenant_id(company_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((u: any) => ({
        id: u.id,
        full_name: u.full_name || '-',
        email: u.email,
        role: u.role,
        is_active: u.is_active,
        tenant_id: u.tenant_id,
        tenant_name: u.tenants?.company_name || '-',
        status: u.is_active ? 'active' : 'inactive',
        last_login: u.last_login || u.created_at,
      }));
    }
  });

  // Fetch tenants for add-user dropdown
  const { data: tenants = [] } = useQuery({
    queryKey: ['platform-tenants-for-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('id, company_name')
        .eq('status', 'active')
        .order('company_name');
      if (error) throw error;
      return data || [];
    }
  });

  const filtered = users.filter((u: any) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesSearch = !searchQ || u.full_name.toLowerCase().includes(searchQ.toLowerCase()) || u.email.toLowerCase().includes(searchQ.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  const openEdit = (user: any) => {
    setEditUser(user);
    setEditForm({
      full_name: user.full_name === '-' ? '' : user.full_name,
      role: user.role,
      is_active: user.is_active ? 'true' : 'false',
    });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editForm.full_name.trim() || null,
          role: editForm.role,
          is_active: editForm.is_active === 'true',
        })
        .eq('id', editUser.id);
      if (error) throw error;
      toast({ title: 'User updated successfully' });
      setEditUser(null);
      queryClient.invalidateQueries({ queryKey: ['platform-users-page'] });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    }
  };

  const handleToggleActive = async (user: any) => {
    const newActive = !user.is_active;
    try {
      const { error } = await supabase.from('users').update({ is_active: newActive }).eq('id', user.id);
      if (error) throw error;
      toast({ title: `${user.full_name} ${newActive ? 'activated' : 'deactivated'}` });
      queryClient.invalidateQueries({ queryKey: ['platform-users-page'] });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    }
  };

  const handleAddUser = async () => {
    if (!addForm.email.trim()) {
      toast({ variant: 'destructive', title: 'Email is required' });
      return;
    }
    if (!addForm.tenant_id && addForm.role !== 'platform_admin') {
      toast({ variant: 'destructive', title: 'Please select a tenant for non-platform roles' });
      return;
    }
    setAdding(true);
    try {
      // Create auth user via Supabase admin (this will trigger the handle_new_user function)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: addForm.email.trim(),
        password: crypto.randomUUID().slice(0, 16) + 'A1!', // Temporary password
        options: {
          data: {
            full_name: addForm.full_name.trim() || addForm.email.split('@')[0],
            role: addForm.role,
            tenant_id: addForm.role === 'platform_admin' ? null : addForm.tenant_id,
          }
        }
      });
      if (authError) throw authError;
      
      toast({ title: 'User created', description: 'A confirmation email has been sent. The user will need to reset their password on first login.' });
      setAddOpen(false);
      setAddForm({ full_name: '', email: '', role: 'viewer', tenant_id: '' });
      queryClient.invaliaccountanteries({ queryKey: ['platform-users-page']accountant   } catch (err: any) {
      toast({ varaccountant'destructive', title: 'Failed to create user', description: err.message });
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div><div className="h-7 w-16 rounded bg-muted animate-pulse" /><div className="h-4 w-48 rounded bg-muted animate-pulse mt-2" /></div>
          <div className="h-10 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="flex gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 w-40 rounded bg-muted animate-pulse" />)}</div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-3 border-t border-border">
              {Array.from({ length: 6 }).map((_, j) => (<div key={j} className="h-4 flex-1 rounded bg-muted animate-pulse" />))}
            </div>
          ))}
        </div>
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

  const columns: Column<any>[] = [
    { key: 'full_name', header: <ColumnHeader title="Name" tooltip="Full name of the user" />, sortable: true },
    { key: 'email', header: <ColumnHeader title="Email" tooltip="User's registered email address" /> },
    {
      key: 'role', header: <ColumnHeader title="Role" tooltip="Platform Admin (full access), Tenant Admin (manages their company), Accountant (financial access), Viewer (read-only)" />, sortable: true,
             <Badge variant="outline" className={ROL| ''}>
          {getLabel(ROLE_LABELS, row.role)}
        </Badge>
      ),
    },
    { key: 'tenant_name', header: <ColumnHeader title="Tenant" tooltip="The company this user belongs to" />, sortable: true },
    {
      key: 'status', header: <ColumnHeader title="Status" tooltip="Active (can log in), Inactive (access revoked)" />,
      render: (row) => (
        <Badge variant="outline" className={row.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}>
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'last_login', header: <ColumnHeader title="Last Login" tooltip="When this user last signed in to the platform" />,
      render: (row) => <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(row.last_login), { addSuffix: true })}</span>,
    },
    {
      key: 'actions', header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${row.is_active ? 'text-destructive' : 'text-success'}`}
            onClick={() => handleToggleActive(row)}
            title={row.is_active ? 'Deactivate user' : 'Activate user'}
          >
            {row.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">Manage all users across tenants</p>
        </div>
        <Button variant="hero" onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add user
        </Button>
      </div>

      {/* Filters + Search in one row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Filter by role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="platform_admin">Platform Admin</SelectItem>
            <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
            <SelectItem value="accountant">Accountant</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Filter by status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="pl-9" />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={10} />

      {/* Add User Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={addForm.full_name} onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="user@company.com" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={addForm.role} onValueChange={(v) => setAddForm({ ...addForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform_admin">Platform Admin</SelectItem>
                  <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addForm.role !== 'platform_admin' && (
              <div className="space-y-2">
                <Label>Assign to Tenant *</Label>
                <Select value={addForm.tenant_id} onValueChange={(v) => setAddForm({ ...addForm, tenant_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select a tenant" /></SelectTrigger>
                  <SelectContent>
                    {tenants.map((t: any) => (
                      <SelectItem key={t.id} value={t.id}>{t.company_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              A confirmation email will be sent. The user will need to set their password on first login.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="hero" onClick={handleAddUser} disabled={adding}>
              {adding && <Loader2 className="h-4 w-4 animate-spin" />} Add user
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editUser?.email || ''} disabled className="opacity-60" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform_admin">Platform Admin</SelectItem>
                  <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.is_active} onValueChange={(v) => setEditForm({ ...editForm, is_active: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="hero" onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
