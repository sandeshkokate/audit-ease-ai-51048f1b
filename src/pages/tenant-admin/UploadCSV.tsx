import { useState, useCallback } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const REQUIRED_COLUMNS = [
  'awb_number', 'courier', 'order_id', 'shipment_status',
  'charged_weight', 'dead_weight', 'length', 'width', 'height',
  'charged_zone', 'origin_pincode', 'destination_pincode',
  'billed_amount', 'is_rto', 'payment_mode'
];

const OPTIONAL_COLUMNS = ['cod_amount', 'delivery_date', 'pickup_date', 'product_name', 'sku'];

const SAMPLE_CSV = `awb_number,courier,order_id,shipment_status,charged_weight,dead_weight,length,width,height,charged_zone,origin_pincode,destination_pincode,billed_amount,is_rto,payment_mode
AWB100001,Delhivery,ORD-5001,delivered,2.5,1.8,20,15,10,B,400001,110001,125.00,no,prepaid
AWB100002,BlueDart,ORD-5002,delivered,1.8,1.2,15,12,8,A,400001,400071,95.50,no,cod
AWB100003,DTDC,ORD-5003,rto,3.0,2.0,25,20,15,D,400001,560001,210.00,yes,prepaid
AWB100004,Ecom Express,ORD-5004,delivered,0.5,0.3,10,8,5,C,400001,700001,68.00,no,prepaid
AWB100005,XpressBees,ORD-5005,delivered,4.2,3.5,30,25,20,E,400001,380001,285.00,no,cod`;

export default function UploadCSV() {
  useDocumentTitle('Upload CSV');
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const { toast } = useToast();

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const hdrs = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1, 11).map(line => line.split(',').map(c => c.trim()));
    return { hdrs, rows };
  };

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith('.csv')) { toast({ variant: 'destructive', title: 'Only CSV files are allowed' }); return; }
    if (f.size > 10 * 1024 * 1024) { toast({ variant: 'destructive', title: 'File exceeds 10MB limit' }); return; }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { hdrs, rows } = parseCSV(text);
      setHeaders(hdrs);
      setPreview(rows);
    };
    reader.readAsText(f);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleProcess = async () => {
    if (!file) return;
    setProcessing(true);
    setProcessingStep('Uploading file...');
    
    try {
      if (!user?.tenant_id) throw new Error('No tenant found');
      if (!user?.id) throw new Error('Not authenticated');
      
      const batchId = crypto.randomUUID();
      
      // Parse CSV to get actual row count
      const text = await file.text();
      const lines = text.trim().split('\n');
      const actualRowCount = lines.length - 1; // minus header row
      
      // Create batch record
      await supabase.from('upload_batches').insert({
        id: batchId,
        tenant_id: user.tenant_id,
        filename: file.name,
        file_size: file.size,
        total_rows: actualRowCount,
        status: 'processing',
        created_by: user.id,
        started_at: new Date().toISOString()
      });
      
      setProcessingStep('Analysing shipments...');
      
      const hdrs = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',');
        const row: Record<string, string> = {};
        hdrs.forEach((h, i) => { row[h] = values[i]?.trim() || ''; });
        return row;
      });
      
      // Call n8n with timeout
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_CSV;
      if (!webhookUrl) throw new Error('Webhook not configured');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: user.tenant_id,
            user_id: user.id,
            batch_id: batchId,
            rows
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        setProcessingStep('Calculating discrepancies...');
        
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        
        toast({
          title: '✅ Upload complete!',
          description: `${result.processed} orders processed, ${result.discrepancies_found} discrepancies found.`
        });
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
          toast({
            title: '⏳ Processing in progress',
            description: 'This is taking longer than expected. Your file has been queued — check Audit Logs in a few minutes.',
          });
          setFile(null); setPreview([]); setHeaders([]);
          return;
        }
        throw error;
      }
      
      setFile(null);
      setPreview([]);
      setHeaders([]);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Failed', description: error.message });
    } finally {
      setProcessing(false);
      setProcessingStep('');
    }
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_template.csv';
    link.click();
  };

  const validationChecklist = REQUIRED_COLUMNS.map(col => ({
    col,
    found: headers.includes(col),
  }));
  const optionalChecklist = OPTIONAL_COLUMNS.map(col => ({
    col,
    found: headers.includes(col),
  }));
  const allValid = validationChecklist.every(v => v.found);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Upload CSV</h1><p className="text-sm text-muted-foreground">Upload your courier billing data for audit</p></div>
        <Button variant="outline" size="sm" className="gap-2" onClick={downloadSample}>
          <Download className="h-4 w-4" /> Sample Template
        </Button>
      </div>

      {!file ? (
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div
              className={cn('flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-16 transition-colors cursor-pointer', dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50')}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('csv-input')?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">Drag & drop your CSV file here</p>
              <p className="text-sm text-muted-foreground mb-4">or click to browse — CSV only, max 10MB</p>
              <Button variant="outline" size="sm">Browse Files</Button>
              <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div>
                    <CardTitle className="text-base">{file.name}</CardTitle>
                    <CardDescription>{(file.size / 1024).toFixed(1)} KB — {preview.length} rows previewed</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreview([]); setHeaders([]); }}>Change File</Button>
              </div>
            </CardHeader>
          </Card>

          {/* Validation Checklist */}
          <Card className="shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-base">Column Validation</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Ensure your CSV contains these required columns. Column names are case-insensitive.</p>
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Required columns:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {validationChecklist.map(v => (
                    <div key={v.col} className="flex items-center gap-2 text-sm">
                      {v.found ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                      <span className={v.found ? 'text-foreground' : 'text-destructive'}>{v.col}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Optional columns (enhance audit accuracy):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {optionalChecklist.map(v => (
                    <div key={v.col} className="flex items-center gap-2 text-sm">
                      {v.found ? <CheckCircle2 className="h-4 w-4 text-success" /> : <span className="h-4 w-4 rounded-full border border-muted-foreground/30 inline-block" />}
                      <span className="text-muted-foreground">{v.col}</span>
                    </div>
                  ))}
                </div>
              </div>
              {!allValid && (
                <div className="flex items-center gap-2 text-sm text-warning">
                  <AlertTriangle className="h-4 w-4" /> Some required columns are missing
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Table */}
          <Card className="shadow-card">
            <CardHeader className="pb-3"><CardTitle className="text-base">Data Preview (first 10 rows)</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {headers.map(h => <TableHead key={h} className="whitespace-nowrap text-xs">{h}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, i) => (
                      <TableRow key={i}>{row.map((cell, j) => <TableCell key={j} className="text-xs">{cell}</TableCell>)}</TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {preview.length === 10 && file && (() => {
            const estimatedRows = Math.round(file.size / 150);
            if (estimatedRows > 5000) {
              return (
                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Large file detected (~{estimatedRows.toLocaleString()} rows). Processing may take 2–3 minutes. Do not close the page.</span>
                </div>
              );
            }
            return null;
          })()}

          <div className="flex justify-end">
            <Button variant="hero" size="lg" className="gap-2" onClick={handleProcess} disabled={processing || !allValid}>
              {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> {processingStep || 'Processing...'}</> : <><Upload className="h-4 w-4" /> Process & Detect Discrepancies</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
