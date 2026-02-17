import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { mockUsers } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';
import { Pencil, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  const filtered = mockUsers.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesRole && matchesStatus;
  });

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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => toast({ title: `${row.full_name} deactivated` })}>
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
