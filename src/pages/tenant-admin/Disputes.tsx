import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { mockDisputes } from '@/lib/tenant-mock-data';
import { formatCurrency } from '@/lib/utils';
import { Mail, Copy, ExternalLink, CheckCircle2, Edit3, X, Loader2, Sparkles, ChevronDown, FileText, Send } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  email_copied: 'bg-primary/10 text-primary border-primary/20',
  raised: 'bg-warning/10 text-warning border-warning/20',
  recovered: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Disputes() {
  const [disputes, setDisputes] = useState(mockDisputes);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [editTo, setEditTo] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const summary = {
    drafts: disputes.filter(d => d.status === 'draft').length,
    copied: disputes.filter(d => d.status === 'email_copied').length,
    awaiting: disputes.filter(d => d.status === 'raised').length,
    recovered: disputes.filter(d => d.status === 'recovered').length,
    rejected: disputes.filter(d => d.status === 'rejected').length,
  };

  const openEmailModal = (dispute: any) => {
    setSelectedDispute(dispute);
    setEditTo(dispute.courier_email);
    setEditSubject(dispute.email_subject);
    setEditBody(dispute.email_body);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(editBody);
    setDisputes(prev => prev.map(d => d.id === selectedDispute.id ? { ...d, is_copied: true, status: 'email_copied' } : d));
    toast({ title: 'Email copied to clipboard!' });
  };

  const handleCopyAndGmail = () => {
    navigator.clipboard.writeText(editBody);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(editTo)}&su=${encodeURIComponent(editSubject)}&body=${encodeURIComponent(editBody)}`;
    window.open(gmailUrl, '_blank');
    setDisputes(prev => prev.map(d => d.id === selectedDispute.id ? { ...d, is_copied: true, status: 'email_copied' } : d));
    toast({ title: 'Copied & Gmail opened!' });
  };

  const handleMarkSent = () => {
    setDisputes(prev => prev.map(d => d.id === selectedDispute.id ? { ...d, is_marked_sent: true, status: 'raised' } : d));
    toast({ title: 'Dispute marked as sent' });
    setSelectedDispute(null);
  };

  const handleGenerateAll = async () => {
    setGenerating(true);
    await new Promise(r => setTimeout(r, 3000));
    toast({ title: 'Dispute emails generated!', description: `${summary.drafts} emails ready for review.` });
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-foreground">Disputes</h1><p className="text-sm text-muted-foreground">Manage and send dispute emails to couriers</p></div>
        <Button variant="hero" className="gap-2" onClick={handleGenerateAll} disabled={generating}>
          {generating ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating with AI...</> : <><Sparkles className="h-4 w-4" /> Generate All Dispute Emails</>}
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
              <Button variant="outline" size="sm" className="gap-2" onClick={() => openEmailModal(dispute)}>
                <Mail className="h-4 w-4" /> Review & Copy Email
              </Button>
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
            <Button variant="default" className="gap-2" onClick={handleMarkSent}><Send className="h-4 w-4" /> Mark as Sent</Button>
            <Button variant="ghost" className="gap-2" onClick={() => toast({ title: 'Regenerating...' })}><Edit3 className="h-4 w-4" /> Regenerate</Button>
            <Button variant="ghost" onClick={() => setSelectedDispute(null)}><X className="h-4 w-4" /></Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
