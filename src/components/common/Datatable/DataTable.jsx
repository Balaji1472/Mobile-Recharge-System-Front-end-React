import React, { useState, useMemo } from 'react';
import { Spinner } from '../index';
import './DataTable.css';

const ITEMS_PER_PAGE = 10;

/* ── Pagination ── */
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="dt-pagination">
      <button
        className="dt-page-btn"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      {getPageNumbers().map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="dt-page-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`dt-page-btn ${p === page ? 'dt-page-btn--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}
      <button
        className="dt-page-btn"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
}

/* ── Sort Icon ── */
function SortIcon({ direction }) {
  if (!direction) return <i className="fa-solid fa-sort dt-sort-icon dt-sort-icon--idle"></i>;
  return direction === 'asc'
    ? <i className="fa-solid fa-sort-up dt-sort-icon dt-sort-icon--active"></i>
    : <i className="fa-solid fa-sort-down dt-sort-icon dt-sort-icon--active"></i>;
}

/**
 * DataTable — Generic reusable table component
 *
 * @prop {Array}   data            — Array of row objects
 * @prop {Array}   columns         — Column definitions (see below)
 * @prop {boolean} isLoading       — Show spinner when true
 * @prop {string}  emptyMessage    — Message when no rows (default: "No data found")
 * @prop {number}  itemsPerPage    — Rows per page (default: 10)
 * @prop {string}  rowKey          — Field to use as row key (default: "id")
 *
 * Column definition shape:
 * {
 *   key: string,           // field name in data object (used for sorting)
 *   label: string,         // column header text
 *   sortable?: boolean,    // enable sort on this column (default: false)
 *   isTimestamp?: boolean, // if true, sorts as Date and defaults to descending (latest first)
 *   width?: string,        // optional CSS width e.g. "120px"
 *   align?: 'left' | 'center' | 'right',  // cell alignment (default: left)
 *   render?: (value, row) => ReactNode,   // custom cell renderer
 * }
 */
export default function DataTable({
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = 'No data found',
  itemsPerPage = ITEMS_PER_PAGE,
  rowKey = 'id',
}) {
  // Find first timestamp column to default sort by it (latest first)
  const defaultSortCol = columns.find((c) => c.isTimestamp);

  const [sortKey, setSortKey] = useState(defaultSortCol?.key || null);
  const [sortDir, setSortDir] = useState(defaultSortCol ? 'desc' : null);
  const [page, setPage] = useState(1);

  /* ── Sorting ── */
  const handleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      // Timestamp columns default to desc (latest first), others to asc
      setSortDir(col.isTimestamp ? 'desc' : 'asc');
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    if (!sortKey) return [...data];
    const col = columns.find((c) => c.key === sortKey);
    return [...data].sort((a, b) => {
      let aVal = a[sortKey];
      let bVal = b[sortKey];
      // Date comparison
      if (col?.isTimestamp) {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      // Numeric comparison
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      // String comparison
      aVal = String(aVal ?? '').toLowerCase();
      bVal = String(bVal ?? '').toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir, columns]);

  /* ── Pagination ── */
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const startItem = sorted.length === 0 ? 0 : (page - 1) * itemsPerPage + 1;
  const endItem = Math.min(page * itemsPerPage, sorted.length);

  return (
    <div className="dt-wrapper">
      {isLoading ? (
        <div className="dt-center">
          <Spinner />
        </div>
      ) : paginated.length === 0 ? (
        <div className="dt-empty">
          <i className="fa-solid fa-inbox"></i>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="dt-table-wrap">
            <table className="dt-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{ width: col.width, textAlign: col.align || 'left' }}
                      className={col.sortable ? 'dt-th--sortable' : ''}
                      onClick={() => col.sortable && handleSort(col)}
                    >
                      <span className="dt-th-inner">
                        {col.label}
                        {col.sortable && (
                          <SortIcon direction={sortKey === col.key ? sortDir : null} />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, rowIdx) => (
                  <tr key={row[rowKey] ?? rowIdx}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ textAlign: col.align || 'left' }}
                        className={`dt-td dt-td--${col.key}`}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="dt-footer">
            <p className="dt-count-text">
              {/* Showing <strong>{startItem}–{endItem}</strong> of <strong>{sorted.length}</strong> records */}
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); }} />
          </div>
        </>
      )}
    </div>
  );
}