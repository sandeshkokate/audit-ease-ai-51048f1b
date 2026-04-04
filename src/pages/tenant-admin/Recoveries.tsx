import { useState, useCallback } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, downloadCSV } from '@/lib/utils';
import { Upload, CheckCircle2, AlertTriangle, XCircle, Loader2, Download } from 'lucide-react';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

type CreditNote = Tables<'credit_notes'>;

import { RECOVERY_STATUS_COLORS as MATCH_COLORS, RECOVERY_STATUS_LABELS } from '@/lib/display-labels';

export default function Recoveries() {
  useDocumentTitle('Recoveries');
  const { user } = useAuth();
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  // #1 FIX: Query credit_notes table directly instead of invalid join on audit_logs
  const { data: recoveries = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['recoveries', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from('credit_notes')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false })
        .range(0, 4999); // Explicit pagination guard
      if (error) throw error;
      return (data || []).map(cn => ({
        id: cn.id,
        awb: cn.awb,
        order_id: cn.order_id,
        courier: cn.courier_name,
        disputed_amount: 0, // credit_notes doesn't have disputed_amount
        amount: cn.amount ?? 0,
        credit_note_number: cn.credit_note_number,
        date: cn.credit_date,
        status: cn.match_status || 'unmatched',
      }));
    },
    enabled: !!user?.tenant_id
  });

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.csv')) { toast({ variant: 'destructive', title: 'Only CSV files' }); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = (e.target?.result as string).trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim());
        return headers.reduce((acc, h, i) => ({ ...acc, [h]: vals[i] || '' }), {} as any);
      });
      setCreditNotes(rows);
    };
    reader.readAsText(f);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleProcessMatching = async () => {
    if (creditNotes.length === 0) {
      toast({ variant: 'destructive', title: 'No credit notes to process' });
      return;
    }
    setProcessing(true);
    try {
      let matched = 0, reviewCount = 0, unmatchedCount = 0;

      for (const cn of creditNotes as any[]) {
        const awb = cn.awb || cn.awb_number || '';
        const orderId = cn.order_id || '';
        const amount = parseFloat(String(cn.amount)) || 0;
        const creditNoteNumber = cn.credit_note_number || '';
        const creditDate = cn.date || cn.credit_date || null;

        let matchStatus = 'unmatched';
        let matchedAuditLogId: string | null = null;

        // Try matching by AWB
        if (awb) {
          const { data: auditLog } = await supabase
            .from('audit_logs')
            .select('id, overcharge_amount')
            .eq('tenant_id', user?.tenant_id)
            .eq('awb_number', awb)
            .gt('overcharge_amount', 0)
            .maybeSingle();

          if (auditLog) {
            matchedAuditLogId = auditLog.id;
            const diff = Math.abs((auditLog.overcharge_amount || 0) - amount);
            matchStatus = diff < 1 ? 'matched' : 'review';
          }
        }

        // Try matching by order_id if AWB didn't match
        if (matchStatus === 'unmatched' && orderId) {
          const { data: shipment } = await supabase
            .from('shipments')
            .select('id, awb_number')
            .eq('tenant_id', user?.tenant_id)
            .eq('order_id', orderId)
            .maybeSingle();

          if (shipment) {
            const { data: auditLog } = await supabase
              .from('audit_logs')
              .select('id, overcharge_amount')
              .eq('tenant_id', user?.tenant_id)
              .eq('awb_number', shipment.awb_number)
              .gt('overcharge_amount', 0)
              .maybeSingle();

            if (auditLog) {
              matchedAuditLogId = auditLog.id;
              const diff = Math.abs((auditLog.overcharge_amount || 0) - amount);
              matchStatus = diff < 1 ? 'matched' : 'review';
            }
          }
        }

        await supabase.from('credit_notes').insert({
          tenant_id: user?.tenant_id!,
          credit_note_number: creditNoteNumber,
          awb: awb || null,
          order_id: orderId || null,
          courier_name: cn.courier || cn.courier_name || null,
          amount,
          credit_date: creditDate,
          match_status: matchStatus,
          matched_audit_log_id: matchedAuditLogId,
          matched_at: matchedAuditLogId ? new Date().toISOString() : null,
          matched_by: matchedAuditLogId ? user?.id : null,
          created_by: user?.id,
        });

        if (matchStatus === 'matched') {
          matched++;
          if (matchedAuditLogId) {
            await supabase.from('audit_logs').update({
              status: 'recovered',
              resolution_notes: `Credit note: ${creditNoteNumber}`,
            } as any).eq('id', matchedAuditLogId);
          }
        } else if (matchStatus === 'review') {
          reviewCount++;
        } else {
          unmatchedCount++;
        }
      }

      toast({
        title: '✅ Matching complete!',
        description: `${matched} matched, ${reviewCount} need review, ${unmatchedCount} unmatched`,
      });
      setFile(null);
      setCreditNotes([]);
      refetch();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Matching failed', description: error.message });
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div><div className="h-7 w-28 rounded bg-muted animate-pulse" /><div className="h-4 w-56 rounded bg-muted animate-pulse mt-2" /></div>
        <div className="rounded-lg border border-border p-6 space-y-3">
          <div className="h-5 w-48 rounded bg-muted animate-pulse" />
          <div className="h-24 w-full rounded bg-muted animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border p-4 space-y-2">
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
              <div className="h-8 w-16 rounded bg-muted animate-pulse" />
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

  const matched = recoveries.filter(r => r.status === 'matched' || r.status === 'recovered');
  const review = recoveries.filter(r => r.status === 'review');
  const unmatched = recoveries.filter(r => r.status === 'unmatched');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-foreground">Recoveries</h1><p className="text-sm text-muted-foreground">Upload credit notes and match with disputes</p></div>
        {recoveries.length > 0 && (
          <Button variant="outline" size="sm" className="gap-2 self-start" onClick={() => downloadCSV(recoveries.map(r => ({
            Credit_Note: r.credit_note_number, AWB: r.awb, Order_ID: r.order_id,
            Courier: r.courier, Recovered_Amount: r.amount,
            Date: r.date, Status: r.status,
          })), 'recoveries')}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        )}
      </div>

      {/* Upload Section */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Upload Credit Notes CSV</CardTitle></CardHeader>
        <CardContent>
          {!file ? (
            <div
              className={cn('flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-10 transition-colors cursor-pointer', dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('cn-input')?.click()}
            >
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium text-foreground">Drag & drop credit notes CSV</p>
              <p className="text-xs text-muted-foreground">CSV with credit_note_number, order_id, awb, amount, date</p>
              <input id="cn-input" type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{file.name} — {creditNotes.length} credit notes</p>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setCreditNotes([]); }}>Change</Button>
              </div>
              {creditNotes.length > 0 && (
                <div className="rounded-lg border overflow-auto max-h-48">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">{Object.keys(creditNotes[0]).map(k => <TableHead key={k} className="text-xs">{k}</TableHead>)}</TableRow>
                    </TableHeader>
                    <TableBody>
                      {creditNotes.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>{Object.values(row).map((v, j) => <TableCell key={j} className="text-xs">{String(v)}</TableCell>)}</TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="hero" className="gap-2" onClick={handleProcessMatching} disabled={processing}>
                  {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Matching...</> : 'Process Matching'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-success/20 shadow-card"><CardContent className="p-4 flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-success" />
          <div><p className="text-xs text-muted-foreground">Auto-Matched</p><p className="text-2xl font-bold text-success">{matched.length}</p><p className="text-xs text-muted-foreground">{formatCurrency(matched.reduce((s, r) => s + r.amount, 0))}</p></div>
        </CardContent></Card>
        <Card className="border-warning/20 shadow-card"><CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-warning" />
          <div><p className="text-xs text-muted-foreground">Needs Review</p><p className="text-2xl font-bold text-warning">{review.length}</p><p className="text-xs text-muted-foreground">{formatCurrency(review.reduce((s, r) => s + r.amount, 0))}</p></div>
        </CardContent></Card>
        <Card className="border-destructive/20 shadow-card"><CardContent className="p-4 flex items-center gap-3">
          <XCircle className="h-8 w-8 text-destructive" />
          <div><p className="text-xs text-muted-foreground">Unmatched</p><p className="text-2xl font-bold text-destructive">{unmatched.length}</p><p className="text-xs text-muted-foreground">{formatCurrency(unmatched.reduce((s, r) => s + r.amount, 0))}</p></div>
        </CardContent></Card>
      </div>

      {/* Results Table */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Recovery Details</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead><ColumnHeader title="Credit Note" tooltip="Reference number from courier acknowledging the credit" /></TableHead>
                  <TableHead><ColumnHeader title="AWB" tooltip="Air Waybill linked to this credit note" /></TableHead>
                  <TableHead><ColumnHeader title="Order" tooltip="Your internal order reference number" /></TableHead>
                  <TableHead><ColumnHeader title="Amount" tooltip="Credit amount received from courier" /></TableHead>
                  <TableHead><ColumnHeader title="Date" tooltip="Date the credit note was issued" /></TableHead>
                  <TableHead><ColumnHeader title="Status" tooltip="Matched (exact AWB match found), Review (partial match needs verification), Unmatched (no corresponding dispute found)" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recoveries.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.credit_note_number}</TableCell>
                    <TableCell>{r.awb || '—'}</TableCell>
                    <TableCell>{r.order_id || '—'}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(r.amount)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.date}</TableCell>
                    <TableCell><Badge variant="outline" className={MATCH_COLORS[r.status]}>{RECOVERY_STATUS_LABELS[r.status] || r.status}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
