import { useDocumentTitle } from '@/hooks/use-document-title';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import DataTable, { Column } from '@/components/shared/DataTable';
import ColumnHeader from '@/components/shared/ColumnHeader';
import { AlertTriangle, Loader2, FileUp, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { UPLOAD_STATUS_LABELS, getLabel } from '@/lib/display-labels';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';

const STATUS_COLORS: Record<string, string> = {
  completed: 'bg-success/10 text-success border-success/20',
  processing: 'bg-warning/10 text-warning border-warning/20',
  failed: 'bg-destructive/10 text-destructive border-destructive/20',
  pending: 'bg-muted text-muted-foreground border-border',
};

export default function UploadHistory() {
  useDocumentTitle('Upload History');
  const { user } = useAuth();
  const [errorLog, setErrorLog] = useState<any>(null);

  const { data: batches = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['upload-batches', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return [];
      const { data, error } = await supabase
        .from('upload_batches')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.tenant_id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="font-semibold">Failed to load upload history</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const stats = {
    total: batches.length,
    completed: batches.filter(b => b.status === 'completed').length,
    failed: batches.filter(b => b.status === 'failed').length,
    totalRows: batches.reduce((s, b) => s + (b.total_rows || 0), 0),
    totalDiscrepancies: batches.reduce((s, b) => s + (b.discrepancy_rows || 0), 0),
  };

  const columns: Column<any>[] = [
    {
      key: 'filename',
      header: <ColumnHeader title="File" tooltip="Original filename uploaded" />,
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium text-sm truncate max-w-[200px]">{r.filename}</p>
          {r.file_size && <p className="text-xs text-muted-foreground">{(r.file_size / 1024).toFixed(0)} KB</p>}
        </div>
      ),
    },
    {
      key: 'status',
      header: <ColumnHeader title="Status" tooltip="Processing status of the upload batch" />,
      sortable: true,
      render: (r) => (
        <Badge variant="outline" className={STATUS_COLORS[r.status] || ''}>
          {getLabel(UPLOAD_STATUS_LABELS, r.status)}
        </Badge>
      ),
    },
    {
      key: 'total_rows',
      header: <ColumnHeader title="Total Rows" tooltip="Total data rows in the CSV" />,
      sortable: true,
      render: (r) => r.total_rows?.toLocaleString() ?? '—',
    },
    {
      key: 'processed_rows',
      header: <ColumnHeader title="Processed" tooltip="Rows successfully processed" />,
      render: (r) => r.processed_rows?.toLocaleString() ?? '—',
    },
    {
      key: 'discrepancy_rows',
      header: <ColumnHeader title="Discrepancies" tooltip="Rows with billing discrepancies detected" />,
      render: (r) => r.discrepancy_rows ? <span className="text-warning font-medium">{r.discrepancy_rows.toLocaleString()}</span> : '0',
    },
    {
      key: 'failed_rows',
      header: <ColumnHeader title="Failed" tooltip="Rows that could not be processed" />,
      render: (r) => r.failed_rows ? <span className="text-destructive font-medium">{r.failed_rows.toLocaleString()}</span> : '0',
    },
    {
      key: 'created_at',
      header: <ColumnHeader title="Uploaded" tooltip="When the file was uploaded" />,
      sortable: true,
      render: (r) => r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : '—',
    },
    {
      key: 'error_log',
      header: 'Errors',
      render: (r) => r.error_log ? (
        <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => setErrorLog(r.error_log)}>
          View errors
        </Button>
      ) : <span className="text-xs text-muted-foreground">None</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload History</h1>
        <p className="text-sm text-muted-foreground">View past CSV uploads, row counts, and processing status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <FileUp className="h-8 w-8 text-primary" />
            <div><p className="text-xs text-muted-foreground">Total Uploads</p><p className="text-2xl font-bold">{stats.total}</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-success" />
            <div><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-bold text-success">{stats.completed}</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-8 w-8 text-muted-foreground" />
            <div><p className="text-xs text-muted-foreground">Total Rows</p><p className="text-2xl font-bold">{stats.totalRows.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <XCircle className="h-8 w-8 text-destructive" />
            <div><p className="text-xs text-muted-foreground">Failed</p><p className="text-2xl font-bold text-destructive">{stats.failed}</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={batches}
        pageSize={20}
        searchable
        searchKeys={['filename', 'status']}
        searchPlaceholder="Search by filename..."
      />

      {/* Error Log Modal */}
      <Dialog open={!!errorLog} onOpenChange={() => setErrorLog(null)}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Error Log</DialogTitle></DialogHeader>
          <pre className="bg-muted rounded-lg p-4 text-xs overflow-auto whitespace-pre-wrap font-mono max-h-96">
            {typeof errorLog === 'string' ? errorLog : JSON.stringify(errorLog, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
