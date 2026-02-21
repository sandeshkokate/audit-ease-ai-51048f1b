import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, UserX, Loader2 } from 'lucide-react';
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

  const handleDeactivate = async (user: any) => {
    try {
      const { error } = await supabase.from('users').update({ is_active: false }).eq('id', user.id);
      if (error) throw error;
      toast({ title: `${user.full_name} deactivated` });
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: `Edit ${row.full_name}` })}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeactivate(row)}>
            <UserX className="h-4 w-4" />
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
    </div>
  );
}
