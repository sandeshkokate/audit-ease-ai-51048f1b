import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import {
  Mail, Copy, ExternalLink, CheckCircle2, Edit3, X, Loader2,
  Sparkles, ChevronDown, FileText, Send, MoreHorizontal,
  CheckCircle, XCircle, MessageSquare, AlertTriangle,
  RotateCcw, Trash2, Calendar,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  email_copied: 'bg-primary/10 text-primary border-primary/20',
  raised: 'bg-warning/10 text-warning border-warning/20',
  recovered: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Disputes() {
  useDocumentTitle('Disputes');
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [editTo, setEditTo] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [generating, setGenerating] = useState(false);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Action modal states
  const [recoveryModal, setRecoveryModal] = useState<{ open: boolean; dispute: any }>({ open: false, dispute: null });
  const [rejectModal, setRejectModal] = useState<{ open: boolean; dispute: any }>({ open: false, dispute: null });
  const [noteModal, setNoteModal] = useState<{ open: boolean; dispute: any }>({ open: false, dispute: null });
  const [followUpModal, setFollowUpModal] = useState<{ open: boolean; dispute: any }>({ open: false, dispute: null });

  // Form states
  const [creditNote, setCreditNote] = useState({ number: '', amount: '', date: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [noteText, setNoteText] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch disputes (audit logs with discrepancies)
  const { data: disputesData, isLoading } = useQuery({
    queryKey: ['disputes', user?.tenant_id, page],
    queryFn: async () => {
      if (!user?.tenant_id) return { items: [], totalCount: 0 };

      const { data, error, count } = await supabase
        .from('audit_logs')
        .select(`
          *,
          dispute_emails(*)
        `, { count: 'exact' })
        .eq('tenant_id', user.tenant_id)
        .gt('discrepancy_amount', 0)
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (error) throw error;

      const items = (data || []).map(log => ({
        id: log.id,
        awb_number: log.awb,
        order_id: log.order_id,
        courier: log.courier_name,
        courier_name: log.courier_name,
        discrepancy_type: log.has_weight_discrepancy ? 'Weight' : log.has_zone_discrepancy ? 'Zone' : 'RTO',
        amount: log.discrepancy_amount,
        discrepancy_amount: log.discrepancy_amount,
        status: log.dispute_status || 'detected',
        courier_email: `billing@${(log.courier_name || 'courier').toLowerCase().replace(/\s+/g, '')}.com`,
        email_subject: log.dispute_emails?.[0]?.subject || '',
        email_body: log.dispute_emails?.[0]?.body || '',
        is_copied: log.dispute_emails?.[0]?.is_copied || false,
        is_marked_sent: log.dispute_status === 'disputed' || log.dispute_status === 'raised',
        dispute_email: log.dispute_emails?.[0] || null,
        dispute_reasoning: log.dispute_emails?.[0]?.dispute_reasoning || null,
        tenant_id: log.tenant_id,
      }));

      return { items, totalCount: count ?? 0 };
    },
    enabled: !!user?.tenant_id
  });

  const disputes = disputesData?.items ?? [];
  const totalCount = disputesData?.totalCount ?? 0;

  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['disputes'] });
  };

  const summary = {
    drafts: disputes.filter(d => !d.status || d.status === 'draft' || d.status === 'detected').length,
    copied: disputes.filter(d => d.status === 'email_copied').length,
    awaiting: disputes.filter(d => d.status === 'raised' || d.status === 'disputed').length,
    recovered: disputes.filter(d => d.status === 'recovered').length,
    rejected: disputes.filter(d => d.status === 'rejected').length,
  };

  const openEmailModal = (dispute: any) => {
    setSelectedDispute(dispute);
    setEditTo(dispute.courier_email);
    setEditSubject(dispute.email_subject);
    setEditBody(dispute.email_body);
  };

  const handleCopyEmail = async () => {
    navigator.clipboard.writeText(editBody);
    if (selectedDispute?.dispute_email?.id) {
      await supabase.from('dispute_emails').update({ is_copied: true, copied_at: new Date().toISOString() }).eq('id', selectedDispute.dispute_email.id);
    }
    toast({ title: 'Email copied to clipboard!' });
    refetch();
  };

  const handleCopyAndGmail = async () => {
    navigator.clipboard.writeText(editBody);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(editTo)}&su=${encodeURIComponent(editSubject)}&body=${encodeURIComponent(editBody)}`;
    window.open(gmailUrl, '_blank');
    if (selectedDispute?.dispute_email?.id) {
      await supabase.from('dispute_emails').update({ is_copied: true, copied_at: new Date().toISOString() }).eq('id', selectedDispute.dispute_email.id);
    }
    toast({ title: 'Copied & Gmail opened!' });
    refetch();
  };

  const handleMarkSent = async (disputeIdOrNull?: string) => {
    const id = disputeIdOrNull || selectedDispute?.id;
    if (!id) return;
    try {
      await supabase.from('audit_logs').update({ dispute_status: 'raised', dispute_raised_date: new Date().toISOString().split('T')[0] }).eq('id', id);
      const emailId = disputeIdOrNull
        ? disputes.find(d => d.id === disputeIdOrNull)?.dispute_email?.id
        : selectedDispute?.dispute_email?.id;
      if (emailId) {
        await supabase.from('dispute_emails').update({ is_marked_sent: true, marked_sent_at: new Date().toISOString(), marked_sent_by: user?.id }).eq('id', emailId);
      }
      toast({ title: 'Dispute marked as sent' });
      setSelectedDispute(null);
      refetch();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const handleGenerateAll = async () => {
    const disputesWithoutEmails = disputes.filter(d => !d.email_body);
    if (disputesWithoutEmails.length === 0) {
      toast({ title: 'All disputes already have emails generated.' });
      return;
    }

    setGenerating(true);
    try {
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_DISPUTES || '';
      if (!webhookUrl) {
        toast({ variant: 'destructive', title: 'Not configured', description: 'Please set VITE_N8N_WEBHOOK_DISPUTES in your environment variables.' });
        setGenerating(false);
        return;
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: user?.tenant_id,
          user_id: user?.id
        })
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast({
        title: '✅ Dispute emails generated!',
        description: `${result.emails_generated} emails ready for review.`
      });
      refetch();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: error.message
      });
    } finally {
      setGenerating(false);
    }
  };

  // Mark as Recovered
  const handleMarkRecovered = async () => {
    if (!creditNote.number || !creditNote.amount) {
      toast({ variant: 'destructive', title: 'Please fill credit note details' });
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('audit_logs')
        .update({
          dispute_status: 'recovered',
          credit_note_number: creditNote.number,
          recovery_amount: parseFloat(creditNote.amount),
          credit_note_date: creditNote.date || null,
        })
        .eq('id', recoveryModal.dispute.id);
      if (error) throw error;

      await supabase.from('activity_logs').insert({
        tenant_id: recoveryModal.dispute.tenant_id,
        user_id: user?.id,
        action: 'dispute_recovered',
        entity_type: 'audit_log',
        entity_id: recoveryModal.dispute.id,
        details: `Credit note ${creditNote.number}, amount ${creditNote.amount}`,
      });

      toast({ title: '✅ Marked as recovered!' });
      setRecoveryModal({ open: false, dispute: null });
      setCreditNote({ number: '', amount: '', date: '' });
      refetch();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Mark as Rejected
  const handleMarkRejected = async () => {
    if (!rejectReason.trim()) {
      toast({ variant: 'destructive', title: 'Please enter rejection reason' });
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('audit_logs')
        .update({
          dispute_status: 'rejected',
          rejection_reason: rejectReason,
          rejected_at: new Date().toISOString(),
        })
        .eq('id', rejectModal.dispute.id);
      if (error) throw error;

      toast({ title: 'Dispute marked as rejected' });
      setRejectModal({ open: false, dispute: null });
      setRejectReason('');
      refetch();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Add Note
  const handleAddNote = async () => {
    if (!noteText.trim()) {
      toast({ variant: 'destructive', title: 'Please enter a note' });
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('dispute_notes')
        .insert({
          tenant_id: noteModal.dispute.tenant_id,
          audit_log_id: noteModal.dispute.id,
          user_id: user?.id ?? '',
          note: noteText,
          note_type: 'general',
        });
      if (error) throw error;

      toast({ title: 'Note added!' });
      setNoteModal({ open: false, dispute: null });
      setNoteText('');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Escalate
  const handleEscalate = async (dispute: any) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('audit_logs')
        .update({
          escalated: true,
          escalated_at: new Date().toISOString(),
          priority: 'high',
        })
        .eq('id', dispute.id);
      if (error) throw error;

      toast({ title: '⚠️ Dispute escalated!', description: 'Priority set to HIGH' });
      refetch();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Withdraw/Cancel
  const handleWithdraw = async (dispute: any) => {
    if (!confirm('Are you sure you want to withdraw this dispute? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('audit_logs')
        .update({ dispute_status: 'cancelled' })
        .eq('id', dispute.id);
      if (error) throw error;

      toast({ title: 'Dispute withdrawn' });
      refetch();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Set Follow-up
  const handleSetFollowUp = async () => {
    if (!followUpDate) {
      toast({ variant: 'destructive', title: 'Please select a date' });
      return;
    }
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('audit_logs')
        .update({ follow_up_date: followUpDate })
        .eq('id', followUpModal.dispute.id);
      if (error) throw error;

      toast({ title: '📅 Follow-up scheduled!' });
      setFollowUpModal({ open: false, dispute: null });
      setFollowUpDate('');
      refetch();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-foreground">Disputes</h1><p className="text-sm text-muted-foreground">Manage and send dispute emails to couriers</p></div>
        <Button variant="hero" className="gap-2" onClick={handleGenerateAll} disabled={generating}>
          {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate All Dispute Emails</>}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Drafts', value: summary.drafts, color: 'text-muted-foreground' },
          { label: 'Copied', value: summary.copied, color: 'text-primary' },
          { label: 'Awaiting', value: summary.awaiting, color: 'text-warning' },
          { label: 'Recovered', value: summary.recovered, color: 'text-success' },
          { label: 'Rejected', value: summary.rejected, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label} className="shadow-card"><CardContent className="p-3 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Dispute Cards */}
      <div className="space-y-3">
        {disputes.map(dispute => (
          <Card key={dispute.id} className="shadow-card hover:shadow-card-hover transition-all">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">{dispute.awb_number}</span>
                  <Badge variant="outline" className={STATUS_COLORS[dispute.status]}>{dispute.status.replace('_', ' ')}</Badge>
                  <span className="text-xs text-muted-foreground">{dispute.courier}</span>
                </div>
                <p className="text-sm text-destructive font-medium">{formatCurrency(dispute.amount)} overcharge</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => openEmailModal(dispute)}>
                  <Mail className="h-4 w-4" /> Review & Copy Email
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-popover">
                    <DropdownMenuItem onClick={() => openEmailModal(dispute)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Review & Edit Email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleMarkSent(dispute.id)}>
                      <Send className="h-4 w-4 mr-2" />
                      Mark as Sent
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setRecoveryModal({ open: true, dispute })} className="text-success focus:text-success">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Recovered
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRejectModal({ open: true, dispute })} className="text-destructive focus:text-destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Mark as Rejected
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setNoteModal({ open: true, dispute })}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Add Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFollowUpModal({ open: true, dispute })}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Set Follow-up
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEscalate(dispute)}>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Escalate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleWithdraw(dispute)} className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Withdraw Dispute
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Email Review Modal */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Review Dispute Email</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>To</Label>
                <Input value={editTo} onChange={(e) => setEditTo(e.target.value)} />
      </div>

      {/* Pagination */}
      {totalCount > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 0}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * PAGE_SIZE >= totalCount}>
              Next
            </Button>
          </div>
        </div>
      )}
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} />
              </div>
            </div>

            {selectedDispute?.dispute_reasoning && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80">
                  <ChevronDown className="h-4 w-4" /> Dispute Reasoning
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2">
                  {selectedDispute.dispute_reasoning.issues.map((issue: any, i: number) => (
                    <Card key={i} className="bg-muted/30"><CardContent className="p-3">
                      <p className="text-sm font-medium capitalize">{issue.type} Issue</p>
                      <p className="text-xs text-muted-foreground">{issue.description}</p>
                      {issue.impact && <p className="text-xs font-medium text-destructive mt-1">Impact: {formatCurrency(issue.impact)}</p>}
                    </CardContent></Card>
                  ))}
                  <p className="text-sm font-semibold">Total Overcharge: {formatCurrency(selectedDispute.dispute_reasoning.total_overcharge)}</p>
                </CollapsibleContent>
              </Collapsible>
            )}

            <div className="space-y-2">
              <Label>Email Body</Label>
              <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={12} className="font-mono text-sm" />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" className="gap-2" onClick={handleCopyEmail}><Copy className="h-4 w-4" /> Copy Email</Button>
            <Button variant="outline" className="gap-2" onClick={handleCopyAndGmail}><ExternalLink className="h-4 w-4" /> Copy & Open Gmail</Button>
            <Button variant="default" className="gap-2" onClick={() => handleMarkSent()}><Send className="h-4 w-4" /> Mark as Sent</Button>
            <Button variant="ghost" className="gap-2" onClick={async () => {
              const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_DISPUTES;
              if (!webhookUrl) { toast({ variant: 'destructive', title: 'Webhook not configured', description: 'VITE_N8N_WEBHOOK_DISPUTES is not set.' }); return; }
              try {
                const res = await fetch(webhookUrl, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tenant_id: selectedDispute?.tenant_id,
                    user_id: user?.id,
                    audit_log_id: selectedDispute?.id,
                    regenerate: true,
                  }),
                });
                if (!res.ok) { const errText = await res.text(); throw new Error(errText || `HTTP ${res.status}`); }
                toast({ title: 'Email regenerated successfully' });
                setSelectedDispute(null);
                refetch();
              } catch (err: any) {
                toast({ variant: 'destructive', title: 'Regeneration failed', description: err.message });
              }
            }}><Edit3 className="h-4 w-4" /> Regenerate</Button>
            <Button variant="ghost" onClick={() => setSelectedDispute(null)}><X className="h-4 w-4" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recovery Modal */}
      <Dialog open={recoveryModal.open} onOpenChange={(open) => !open && setRecoveryModal({ open: false, dispute: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              Mark as Recovered
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              AWB: <span className="font-medium text-foreground">{recoveryModal.dispute?.awb_number}</span>
            </p>
            <div className="space-y-2">
              <Label>Credit Note Number *</Label>
              <Input
                placeholder="CN-12345"
                value={creditNote.number}
                onChange={(e) => setCreditNote({ ...creditNote, number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount Recovered (₹) *</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={creditNote.amount}
                onChange={(e) => setCreditNote({ ...creditNote, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Credit Note Date</Label>
              <Input
                type="date"
                value={creditNote.date}
                onChange={(e) => setCreditNote({ ...creditNote, date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRecoveryModal({ open: false, dispute: null })}>Cancel</Button>
            <Button onClick={handleMarkRecovered} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Recovery'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Modal */}
      <Dialog open={rejectModal.open} onOpenChange={(open) => !open && setRejectModal({ open: false, dispute: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Mark as Rejected
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              AWB: <span className="font-medium text-foreground">{rejectModal.dispute?.awb_number}</span>
            </p>
            <div className="space-y-2">
              <Label>Rejection Reason *</Label>
              <Textarea
                placeholder="Enter the courier's rejection reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal({ open: false, dispute: null })}>Cancel</Button>
            <Button variant="destructive" onClick={handleMarkRejected} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Modal */}
      <Dialog open={noteModal.open} onOpenChange={(open) => !open && setNoteModal({ open: false, dispute: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Add Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              AWB: <span className="font-medium text-foreground">{noteModal.dispute?.awb_number}</span>
            </p>
            <div className="space-y-2">
              <Label>Note *</Label>
              <Textarea
                placeholder="Add your note or follow-up details..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModal({ open: false, dispute: null })}>Cancel</Button>
            <Button onClick={handleAddNote} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Follow-up Modal */}
      <Dialog open={followUpModal.open} onOpenChange={(open) => !open && setFollowUpModal({ open: false, dispute: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Set Follow-up Date
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              AWB: <span className="font-medium text-foreground">{followUpModal.dispute?.awb_number}</span>
            </p>
            <div className="space-y-2">
              <Label>Follow-up Date *</Label>
              <Input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFollowUpModal({ open: false, dispute: null })}>Cancel</Button>
            <Button onClick={handleSetFollowUp} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Set Reminder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
