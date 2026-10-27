import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { Pagination } from './Navigation';
import { EmptyState, Skeleton } from './States';
import { cn } from '../../utils/format';

/**
 * columns: [{ key, header, render?(row), sort?(row)→value, className?, align? }]
 * Wide tables scroll horizontally inside their own container on small screens.
 */
export function DataTable({ columns, rows, pageSize = 10, empty, loading, rowKey = 'id', onRowClick, initialSort, dense }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort || null);
  useEffect(() => setPage(1), [rows.length]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sort) return rows;
    return [...rows].sort((a, b) => {
      const x = col.sort(a);
      const y = col.sort(b);
      return (x > y ? 1 : x < y ? -1 : 0) * (sort.dir === 'asc' ? 1 : -1);
    });
  }, [rows, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const view = sorted.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }
  if (!rows.length) return <div className="p-4">{empty || <EmptyState title="Nothing here yet" message="No records match the current filters." />}</div>;

  return (
    <div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn(c.align === 'right' && 'text-right', c.className)}>
                  {c.sort ? (
                    <button
                      type="button"
                      className={cn('inline-flex items-center gap-1 uppercase hover:text-ink-900', c.align === 'right' && 'flex-row-reverse')}
                      onClick={() => setSort((s) => ({ key: c.key, dir: s?.key === c.key && s.dir === 'desc' ? 'asc' : 'desc' }))}
                    >
                      {c.header}
                      {sort?.key === c.key ? sort.dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" /> : <ChevronsUpDown className="h-3 w-3 opacity-50" />}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr key={r[rowKey]} onClick={onRowClick ? () => onRowClick(r) : undefined} className={onRowClick ? 'cursor-pointer' : undefined}>
                {columns.map((c) => (
                  <td key={c.key} className={cn(c.align === 'right' && 'text-right', dense && 'py-2', c.className)}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination className="border-t border-mist-100 px-4 py-3" page={page} pages={pages} onChange={setPage} total={sorted.length} pageSize={pageSize} />
    </div>
  );
}
