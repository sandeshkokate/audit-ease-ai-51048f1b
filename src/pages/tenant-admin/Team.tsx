import { useState } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import DataTable, { Column } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { mockTeamMembers } from '@/lib/tenant-mock-data';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Pencil, UserX } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  tenant_admin: 'bg-primary/10 text-primary border-primary/20',
  accountant: 'bg-warning/10 text-warning border-warning/20',
  viewer: 'bg-muted text-muted-foreground border-border',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  tenant_admin: 'Full access to all features including team management and billing',
  accountant: 'Can view invoices, reports, and financial data. Cannot manage disputes.',
  viewer: 'Read-only access to dashboards and pre-built reports only.',
};

export default function Team() {
  useDocumentTitle('Team');
  const [members] = useState(mockTeamMembers);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [confirmRemove, setConfirmRemove] = useState<any>(null);
  const { toast } = useToast();

  const columns: Column<any>[] = [
    { key: 'name', header: 'Name', sortable: true },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (r) => <Badge variant="outline" className={ROLE_COLORS[r.role]}>{r.role.replace('_', ' ')}</Badge> },
    { key: 'status', header: 'Status', render: (r) => <Badge variant="outline" className={r.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}>{r.status}</Badge> },
    { key: 'last_login', header: 'Last Login', render: (r) => <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(r.last_login), { addSuffix: true })}</span> },
    { key: 'actions', header: '', render: (r) => (
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast({ title: `Edit ${r.name}` })}><Pencil className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConfirmRemove(r)}><UserX className="h-4 w-4" /></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Team</h1><p className="text-sm text-muted-foreground">Manage your team members</p></div>
        <Button variant="hero" className="gap-2" onClick={() => setShowInvite(true)}><UserPlus className="h-4 w-4" /> Invite Member</Button>
      </div>
      <DataTable columns={columns} data={members} pageSize={10} searchable searchKeys={['name', 'email']} searchPlaceholder="Search team..." />

      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} /></div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[inviteRole]}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
            <Button variant="hero" onClick={() => { toast({ title: `Invitation sent to ${inviteEmail}` }); setShowInvite(false); setInviteEmail(''); }}>Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmRemove}
        onOpenChange={() => setConfirmRemove(null)}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${confirmRemove?.name}? They will lose access immediately.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={() => { toast({ title: `${confirmRemove.name} removed` }); setConfirmRemove(null); }}
      />
    </div>
  );
}
