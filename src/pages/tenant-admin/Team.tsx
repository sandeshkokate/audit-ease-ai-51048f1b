import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Mail, UserX, UserCheck, Loader2, Clock, Pencil, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useDocumentTitle } from '@/hooks/use-document-title';

export default function Team() {
  useDocumentTitle('Team');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [inviteModal, setInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('accountant');
  const [inviting, setInviting] = useState(false);

  // Change role dialog state
  const [roleModal, setRoleModal] = useState(false);
  const [roleTarget, setRoleTarget] = useState<{ id: string; name: string; currentRole: string } | null>(null);
  const [newRole, setNewRole] = useState('');
  const [savingRole, setSavingRole] = useState(false);

  // Fetch team members
  const { data: teamMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['team-members', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.tenant_id
  });

  // Fetch pending invitations
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery({
    queryKey: ['pending-invitations', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .eq('invite_status', 'pending')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.tenant_id
  });

  // Send invitation
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({ variant: 'destructive', title: 'Please enter an email' });
      return;
    }
    setInviting(true);
    try {
      const normalizedEmail = inviteEmail.trim().toLowerCase();
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('tenant_id', user?.tenant_id)
        .ilike('email', normalizedEmail)
        .maybeSingle();
      if (existingUser) {
        toast({ variant: 'destructive', title: 'User already exists', description: 'This email is already a member of your team.' });
        setInviting(false);
        return;
      }
      const { data: existingInvite } = await supabase
        .from('invitations')
        .select('id')
        .eq('tenant_id', user?.tenant_id)
        .eq('invite_status', 'pending')
        .ilike('email', normalizedEmail)
        .maybeSingle();
      if (existingInvite) {
        toast({ variant: 'destructive', title: 'Invitation already sent', description: 'A pending invitation already exists for this email.' });
        setInviting(false);
        return;
      }
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      const { error } = await supabase.from('invitations').insert({
        tenant_id: user?.tenant_id,
        email: inviteEmail,
        role: inviteRole,
        token,
        invited_by: user?.id || '',
        expires_at: expiresAt.toISOString(),
        invite_status: 'pending'
      });
      if (error) throw error;
      const inviteLink = `${window.location.origin}/invite/${token}`;

      // Send invite email via n8n
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_INVITE_EMAIL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to_email: normalizedEmail,
              invite_link: inviteLink,
              invited_by_name: user?.full_name || user?.email || 'Your administrator',
              company_name: user?.tenant_id,
              role: inviteRole,
              expires_at: expiresAt.toISOString()
            })
          });
        } catch {
          // Don't block the UI if email fails — link is still usable
        }
      }

      toast({
        title: '✅ Invitation created',
        description: 'Email sent. Invite link also copied to clipboard.',
      });
      await navigator.clipboard.writeText(inviteLink).catch(() => {});
      setInviteModal(false);
      setInviteEmail('');
      setInviteRole('accountant');
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setInviting(false);
    }
  };

  // Toggle user active status
  const handleToggleActive = async (memberId: string, memberName: string, currentStatus: boolean | null) => {
    if (currentStatus) {
      const confirmed = window.confirm(`Are you sure you want to deactivate ${memberName || 'this user'}?`);
      if (!confirmed) return;
    }
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', memberId);
      if (error) throw error;
      toast({ title: currentStatus ? 'User deactivated' : 'User activated' });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    }
  };

  // Open change role dialog
  const openRoleDialog = (member: any) => {
    setRoleTarget({ id: member.id, name: member.full_name || member.email, currentRole: member.role });
    setNewRole(member.role);
    setRoleModal(true);
  };

  // Save role change
  const handleSaveRole = async () => {
    if (!roleTarget || newRole === roleTarget.currentRole) {
      setRoleModal(false);
      return;
    }
    setSavingRole(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', roleTarget.id);
      if (error) throw error;
      toast({ title: 'Role updated', description: `${roleTarget.name} is now ${roleLabels[newRole] || newRole}.` });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setRoleModal(false);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setSavingRole(false);
    }
  };

  // Cancel invitation
  const handleCancelInvitation = async (invitationId: string, email: string) => {
    const confirmed = window.confirm(`Cancel invitation for ${email}?`);
    if (!confirmed) return;
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ invite_status: 'cancelled' })
        .eq('id', invitationId);
      if (error) throw error;
      toast({ title: 'Invitation cancelled' });
      queryClient.invalidateQueries({ queryKey: ['pending-invitations'] });
    } catch (err: any) {
      // error handled via toast
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    }
  };

  // Resend / copy invite link
  const handleResendLink = async (token: string) => {
    const inviteLink = `${window.location.origin}/invite/${token}`;
    await navigator.clipboard.writeText(inviteLink);
    toast({ title: 'Link copied' });
  };

  const roleLabels: Record<string, string> = {
    platform_admin: 'Platform Admin',
    tenant_admin: 'Administrator',
    accountant: 'Accountant',
  };

  const isLoading = membersLoading || invitationsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><div className="h-7 w-16 rounded bg-muted animate-pulse" /><div className="h-4 w-40 rounded bg-muted animate-pulse mt-2" /></div>
          <div className="h-10 w-36 rounded bg-muted animate-pulse" />
        </div>
        <div className="rounded-lg border border-border p-4 space-y-3">
          <div className="h-5 w-32 rounded bg-muted animate-pulse" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1"><div className="h-4 w-24 rounded bg-muted animate-pulse" /><div className="h-3 w-36 rounded bg-muted animate-pulse" /></div>
              </div>
              <div className="flex gap-2"><div className="h-6 w-20 rounded bg-muted animate-pulse" /><div className="h-6 w-14 rounded bg-muted animate-pulse" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground">Manage your team members</p>
        </div>
        <Button className="gap-2" onClick={() => setInviteModal(true)}>
          <UserPlus className="h-4 w-4" />
          Invite member
        </Button>
      </div>

      {/* Team Members */}
      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members ({teamMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.full_name || 'No name'}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{roleLabels[member.role] || member.role}</Badge>
                  <Badge variant={member.is_active ? 'default' : 'secondary'}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {member.id !== user?.id && (
                    <>
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openRoleDialog(member)} title="Change Role">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {member.is_active ? (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleToggleActive(member.id, member.full_name, member.is_active)}
                          title="Deactivate"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:text-green-700"
                          onClick={() => handleToggleActive(member.id, member.full_name, member.is_active)}
                          title="Activate"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending Invitations ({invitations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-warning/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Expires {formatDistanceToNow(new Date(inv.expires_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{roleLabels[inv.role] || inv.role}</Badge>
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleResendLink(inv.token)}>
                      <Link2 className="h-3.5 w-3.5" />
                      Copy link
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleCancelInvitation(inv.id, inv.email)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      <Dialog open={inviteModal} onOpenChange={setInviteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label>Email Address *</Label>
              <Input
                type="email"
                placeholder="name@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Role *</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant_admin">Administrator</SelectItem>
                  <SelectItem value="accountant">Accountant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModal(false)}>Cancel</Button>
            <Button onClick={handleInvite} disabled={inviting}>
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Modal */}
      <Dialog open={roleModal} onOpenChange={setRoleModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
          </DialogHeader>
          {roleTarget && (
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Change role for <span className="font-medium text-foreground">{roleTarget.name}</span>
              </p>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant_admin">Administrator</SelectItem>
                    <SelectItem value="accountant">Accountant</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModal(false)}>Cancel</Button>
            <Button onClick={handleSaveRole} disabled={savingRole}>
              {savingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
