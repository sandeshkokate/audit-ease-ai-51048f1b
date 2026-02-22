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
import { Pencil, UserX, UserCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ROLE_COLORS: Record<string, string> = {
  platform_admin: 'bg-primary/10 text-primary border-primary/20',
  tenant_admin: 'bg-accent/10 text-accent border-accent/20',
  accountant: 'bg-warning/10 text-warning border-warning/20',
  viewer: 'bg-muted text-muted-foreground border-border',
};

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editUser, setEditUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<{ full_name: string; role: string; is_active: string }>({ full_name: '', role: '', is_active: 'true' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
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
        tenant_name: u.tenants?.company_name || '-',
        status: u.is_active ? 'active' : 'inactive',
        last_login: u.last_login || u.created_at,
      }));
    }
  });

  const filtered = users.filter((u: any) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesRole && matchesStatus;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const columns: Column<any>[] = [
    { key: 'full_name', header: <ColumnHeader title="Name" tooltip="Full name of the user" />, sortable: true },
    { key: 'email', header: <ColumnHeader title="Email" tooltip="User's registered email address" /> },
    {
      key: 'role', header: <ColumnHeader title="Role" tooltip="Platform Admin (full access), Tenant Admin (manages their company), Accountant (financial access), Viewer (read-only)" />, sortable: true,
      render: (row) => (
        <Badge variant="outline" className={ROLE_COLORS[row.role] || ''}>
          {row.role.replace('_', ' ')}
        </Badge>
      ),
    },
    { key: 'tenant_name', header: <ColumnHeader title="Tenant" tooltip="The company this user belongs to" />, sortable: true },
    {
      key: 'status', header: <ColumnHeader title="Status" tooltip="Active (can log in), Inactive (access revoked)" />,
      render: (row) => (
        <Badge variant="outline" className={row.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground border-border'}>
          {row.status}
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground">Manage all users across tenants</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
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
      </div>

      <DataTable columns={columns} data={filtered} searchable searchKeys={['full_name', 'email']} searchPlaceholder="Search users..." pageSize={10} />

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
