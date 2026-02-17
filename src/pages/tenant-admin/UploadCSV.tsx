import { useState, useCallback } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, Download, Loader2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const REQUIRED_COLUMNS = ['awb_number', 'courier', 'weight', 'zone', 'amount', 'order_id'];
const SAMPLE_CSV = `awb_number,courier,weight,zone,amount,order_id,dimensions_l,dimensions_w,dimensions_h\nAWB100001,Delhivery,2.5,B,125.00,ORD-5001,20,15,10\nAWB100002,BlueDart,1.8,A,95.50,ORD-5002,15,12,8`;

export default function UploadCSV() {
  useDocumentTitle('Upload CSV');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
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
    setProcessing(true);
    // Simulate processing
    await new Promise(r => setTimeout(r, 3000));
    toast({ title: 'Upload complete!', description: `${preview.length} orders processed, ${Math.floor(preview.length * 0.3)} discrepancies found.` });
    setProcessing(false);
    setFile(null);
    setPreview([]);
    setHeaders([]);
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
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {validationChecklist.map(v => (
                  <div key={v.col} className="flex items-center gap-2 text-sm">
                    {v.found ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}
                    <span className={v.found ? 'text-foreground' : 'text-destructive'}>{v.col}</span>
                  </div>
                ))}
              </div>
              {!allValid && (
                <div className="mt-3 flex items-center gap-2 text-sm text-warning">
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

          <div className="flex justify-end">
            <Button variant="hero" size="lg" className="gap-2" onClick={handleProcess} disabled={processing || !allValid}>
              {processing ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><Upload className="h-4 w-4" /> Process Upload</>}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
