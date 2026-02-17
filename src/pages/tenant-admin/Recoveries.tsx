import { useState, useCallback } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { mockRecoveries } from '@/lib/tenant-mock-data';
import { formatCurrency } from '@/lib/utils';
import { Upload, CheckCircle2, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { cn } from '@/lib/utils';

const MATCH_COLORS: Record<string, string> = {
  matched: 'bg-success/10 text-success border-success/20',
  review: 'bg-warning/10 text-warning border-warning/20',
  unmatched: 'bg-destructive/10 text-destructive border-destructive/20',
};

export default function Recoveries() {
  useDocumentTitle('Recoveries');
  const [creditNotes, setCreditNotes] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(mockRecoveries);
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

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
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2500));
    toast({ title: 'Matching complete!', description: '3 auto-matched, 1 needs review, 1 unmatched' });
    setProcessing(false);
  };

  const matched = results.filter(r => r.status === 'matched');
  const review = results.filter(r => r.status === 'review');
  const unmatched = results.filter(r => r.status === 'unmatched');

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Recoveries</h1><p className="text-sm text-muted-foreground">Upload credit notes and match with disputes</p></div>

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
                  <TableHead>Order</TableHead>
                  <TableHead><ColumnHeader title="Amount" tooltip="Credit amount received from courier" /></TableHead>
                  <TableHead><ColumnHeader title="Date" tooltip="Date the credit note was issued" /></TableHead>
                  <TableHead><ColumnHeader title="Status" tooltip="Auto-matched (exact AWB match found), Review (partial match needs verification), Unmatched (no corresponding dispute found)" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.credit_note_number}</TableCell>
                    <TableCell>{r.awb || '—'}</TableCell>
                    <TableCell>{r.order_id || '—'}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(r.amount)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.date}</TableCell>
                    <TableCell><Badge variant="outline" className={MATCH_COLORS[r.status]}>{r.status}</Badge></TableCell>
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
