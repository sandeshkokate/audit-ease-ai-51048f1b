import { useState, useMemo, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  actions?: React.ReactNode;
  virtualize?: boolean;
}

const ROW_HEIGHT = 48;
const VIRTUAL_THRESHOLD = 100;

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchKeys = [],
  actions,
  virtualize = false,
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q))
    );
  }, [data, search, searchKeys]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = typeof aVal === 'number' ? aVal - (bVal as number) : String(aVal).localeCompare(String(bVal));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const shouldVirtualize = virtualize || sorted.length >= VIRTUAL_THRESHOLD;
  const totalPages = shouldVirtualize ? 1 : Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = shouldVirtualize ? sorted : sorted.slice(page * pageSize, (page + 1) * pageSize);

  const virtualizer = useVirtualizer({
    count: paged.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 20,
    enabled: shouldVirtualize,
  });

  const toggleSort = (key: string) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const renderHeader = () => (
    <TableHeader>
      <TableRow className="bg-muted/50">
        {columns.map((col) => (
          <TableHead key={col.key} className="whitespace-nowrap">
            {col.sortable ? (
              <button
                className="flex items-center gap-1 hover:text-foreground transition-colors group"
                onClick={() => toggleSort(col.key)}
              >
                {typeof col.header === 'string' ? col.header : col.header}
                {sortKey === col.key ? (
                  sortDir === 'asc' ?
                    <ArrowUp className="h-3.5 w-3.5 text-primary" /> :
                    <ArrowDown className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                )}
              </button>
            ) : (
              col.header
            )}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );

  const renderRow = (row: T, i: number) => (
    <TableRow key={i} className="hover:bg-muted/30">
      {columns.map((col) => (
        <TableCell key={col.key}>{col.render ? col.render(row) : String(row[col.key] ?? '')}</TableCell>
      ))}
    </TableRow>
  );

  return (
    <div className="space-y-4">
      {(searchable || actions) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {searchable && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-9"
              />
            </div>
          )}
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className="rounded-lg border border-border overflow-hidden">
        {/* Horizontal scroll wrapper for mobile */}
        <div className="overflow-x-auto">
          {shouldVirtualize ? (
            <div ref={scrollRef} style={{ maxHeight: 500, overflow: 'auto' }}>
              <Table>
                {renderHeader()}
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                        No data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    <>
                      {virtualizer.getVirtualItems().length > 0 && (
                        <tr style={{ height: virtualizer.getVirtualItems()[0]?.start ?? 0 }}><td colSpan={columns.length} /></tr>
                      )}
                      {virtualizer.getVirtualItems().map((virtualRow) => {
                        const row = paged[virtualRow.index];
                        return renderRow(row, virtualRow.index);
                      })}
                      {virtualizer.getVirtualItems().length > 0 && (
                        <tr style={{ height: virtualizer.getTotalSize() - (virtualizer.getVirtualItems().at(-1)?.end ?? 0) }}><td colSpan={columns.length} /></tr>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Table>
              {renderHeader()}
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((row, i) => renderRow(row, i))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {!shouldVirtualize && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {sorted.length} result{sorted.length !== 1 ? 's' : ''} — Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(0)}>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {shouldVirtualize && (
        <p className="text-sm text-muted-foreground">
          {sorted.length} result{sorted.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
