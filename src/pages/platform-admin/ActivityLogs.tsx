import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DataTable, { Column } from '@/components/shared/DataTable';
import { mockActivityLogs } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';
import { Search } from 'lucide-react';

export default function ActivityLogs() {
  const [userFilter, setUserFilter] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  const uniqueUsers = [...new Set(mockActivityLogs.map((l) => l.user))];

  const filtered = mockActivityLogs.filter((l) => {
    const matchesUser = userFilter === 'all' || l.user === userFilter;
    const matchesSearch = !searchQ || l.action.toLowerCase().includes(searchQ.toLowerCase()) || l.tenant.toLowerCase().includes(searchQ.toLowerCase());
    return matchesUser && matchesSearch;
  });

  const columns: Column<any>[] = [
    {
      key: 'time', header: 'Time', sortable: true,
      render: (row) => <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(row.time), { addSuffix: true })}</span>,
    },
    { key: 'tenant', header: 'Tenant', sortable: true },
    { key: 'user', header: 'User', sortable: true },
    { key: 'action', header: 'Action' },
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
