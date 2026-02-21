import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { formatDistanceToNow } from 'date-fns';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function ActivityLogs() {
  const [userFilter, setUserFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['platform-activity-logs-page'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          users:user_id(full_name, email),
          tenants:tenant_id(company_name)
        `)
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []).map((log: any) => ({
        id: log.id,
        time: log.created_at,
        tenant: log.tenants?.company_name || 'System',
        user: log.users?.full_name || log.users?.email || 'Unknown',
        action: log.action || log.details || 'Activity',
      }));
    }
  });

  const uniqueUsers = [...new Set(logs.map((l: any) => l.user))];

  const filtered = logs.filter((l: any) => {
    const matchesUser = userFilter === 'all' || l.user === userFilter;
    const matchesSearch = !searchQ || l.action.toLowerCase().includes(searchQ.toLowerCase()) || l.tenant.toLowerCase().includes(searchQ.toLowerCase());
    return matchesUser && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const columns: Column<any>[] = [
    {
      key: 'time', header: <ColumnHeader title="Time" tooltip="When this activity occurred" />, sortable: true,
      render: (row) => <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(row.time), { addSuffix: true })}</span>,
    },
    { key: 'tenant', header: <ColumnHeader title="Tenant" tooltip="The company/tenant where this activity happened" />, sortable: true },
    { key: 'user', header: <ColumnHeader title="User" tooltip="The user who performed this action" />, sortable: true },
    { key: 'action', header: <ColumnHeader title="Action" tooltip="Description of the activity performed" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">Track all platform activity</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search actions..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter by user" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            {uniqueUsers.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filtered} pageSize={50} />
    </div>
  );
}
