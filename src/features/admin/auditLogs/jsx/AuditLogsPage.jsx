import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadAuditLogs, resetAuditLogs } from '../slice/auditLogsSlice';
import { useToast } from '../../../../hooks/useToast';
import DataTable from '../../../../components/common/DataTable/DataTable';
import '../css/AuditLogsPage.css';

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

/* ── Action Badge ── */
function ActionBadge({ action }) {
  const map = {
    CREATE:       'al-badge--create',
    UPDATE:       'al-badge--update',
    DELETE:       'al-badge--delete',
    BLOCK_USER:   'al-badge--block',
    UNBLOCK_USER: 'al-badge--unblock',
    UPDATE_PRICE: 'al-badge--price',
  };
  return (
    <span className={`al-badge ${map[action] || 'al-badge--update'}`}>
      {action}
    </span>
  );
}

/* ── Stat Card ── */
function StatCard({ icon, count, label, colorClass }) {
  return (
    <div className={`al-stat-card al-stat--${colorClass}`}>
      <div className="al-stat-icon"><i className={`fa-solid ${icon}`}></i></div>
      <p className="al-stat-count">{count}</p>
      <p className="al-stat-label">{label}</p>
    </div>
  );
}

/* ── View Modal ── */
function ViewLogModal({ log, onClose }) {
  if (!log) return null;
  return (
    <div className="al-overlay" onClick={onClose}>
      <div className="al-modal" onClick={(e) => e.stopPropagation()}>
        <div className="al-modal-header">
          <div className="al-modal-title-group">
            <h3 className="al-modal-title">Audit Log Details</h3>
            <p className="al-modal-hint">Log ID #{log.id ?? log.logId}</p>
          </div>
          <button className="al-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="al-modal-body">
          <div className="al-modal-badge-row"><ActionBadge action={log.action} /></div>
          <hr className="al-modal-divider" />
          <div className="al-detail-grid">
            <DetailRow icon="fa-user"        label="Performed By" value={`User #${log.performedBy}`} />
            <DetailRow icon="fa-database"    label="Entity"       value={log.entityName} />
            <DetailRow icon="fa-hashtag"     label="Entity ID"    value={log.entityId} />
            <DetailRow icon="fa-clock"       label="Timestamp"    value={formatDateTime(log.timestamp)} />
            <DetailRow icon="fa-arrow-left"  label="Old Value"    value={log.oldValue || '—'} />
            <DetailRow icon="fa-arrow-right" label="New Value"    value={log.newValue || '—'} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="al-detail-row">
      <span className="al-detail-label"><i className={`fa-solid ${icon}`}></i> {label}</span>
      <span className="al-detail-value">{value}</span>
    </div>
  );
}

/* ── Column definitions ── */
function buildColumns(onViewLog) {
  return [
    {
      key: 'entityName',
      label: 'Entity Name',
      sortable: false,           
      render: (val) => <span className="al-entity-name">{val}</span>,
    },
    {
      key: 'entityId',
      label: 'Entity ID',
      sortable: false,
    },
    {
      key: 'action',
      label: 'Action',
      sortable: false,
      render: (val) => <ActionBadge action={val} />,
    },
    {
      key: 'performedBy',
      label: 'Performed By',
      sortable: false,
      render: (val) => (
        <span className="al-user-chip">
          <i className="fa-solid fa-user"></i> #{val}
        </span>
      ),
    },
    {
      key: 'oldValue',
      label: 'Old Value',
      render: (val) => <span className="al-value-cell">{val || '—'}</span>,
    },
    {
      key: 'newValue',
      label: 'New Value',
      render: (val) => <span className="al-value-cell">{val || '—'}</span>,
    },
    {
      key: 'timestamp',
      label: 'Timestamp',
      sortable: false,           
      render: (val) => <span className="al-timestamp">{formatDateTime(val)}</span>,
    },
    {
      key: '_actions',
      label: '',
      width: '56px',
      align: 'center',
      render: (_, row) => (
        <button className="al-view-btn" onClick={() => onViewLog(row)}>
          <i className="fa-solid fa-eye"></i>
        </button>
      ),
    },
  ];
}

/* ── Server-side Pagination Controls ── */
function ServerPagination({ currentPage, totalPages, totalElements, pageSize, onPageChange, isLoading }) {
  if (totalPages <= 1) return null;

  const startRecord = currentPage * pageSize + 1;
  const endRecord   = Math.min((currentPage + 1) * pageSize, totalElements);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push('...');
      const start = Math.max(1, currentPage - 1);
      const end   = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className="al-table-footer">
      <p className="al-count-text">
        Showing <strong>{startRecord}–{endRecord}</strong> of <strong>{totalElements}</strong> logs
      </p>
      <div className="al-pagination">
        {/* Prev */}
        <button
          className="al-page-btn"
          disabled={currentPage === 0 || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} className="al-page-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`al-page-btn ${p === currentPage ? 'al-page-btn--active' : ''}`}
              disabled={isLoading}
              onClick={() => onPageChange(p)}
            >
              {p + 1}  {/* display 1-based to user */}
            </button>
          )
        )}

        {/* Next */}
        <button
          className="al-page-btn"
          disabled={currentPage === totalPages - 1 || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

/* ── Export helper ── */
function exportToCSV(data, toast) {
  try {
    if (!data || data.length === 0) {
      toast('No logs available to export', 'error');
      return;
    }
    const rows = [
      ['Entity Name', 'Entity ID', 'Action', 'Performed By', 'Old Value', 'New Value', 'Timestamp'],
      ...data.map((l) => [
        l.entityName,
        l.entityId,
        l.action,
        l.performedBy,
        l.oldValue  || '',
        l.newValue  || '',
        formatDateTime(l.timestamp),
      ]),
    ];
    const csv  = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'audit-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('Audit logs exported successfully', 'success');
  } catch {
    toast('Export failed. Please try again.', 'error');
  }
}

/* ── Main Page ── */
export default function AuditLogsPage() {
  const dispatch  = useDispatch();
  const { toast } = useToast();

  const {
    data: logs,          
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.auditLogs);

  const { accessToken } = useSelector((state) => state.auth);

  const [search,       setSearch]       = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedLog,  setSelectedLog]  = useState(null);

  /* ── Fetch page from backend ── */
  const fetchPage = (page) => {
    dispatch(loadAuditLogs({ page, size: pageSize }));
  };

  /* ── Fetch first page on mount ── */
  useEffect(() => {
    if (accessToken) fetchPage(0);
    return () => { dispatch(resetAuditLogs()); };
  }, [dispatch, accessToken]);

  useEffect(() => {
    if (isError && message) toast(message, 'error');
  }, [isError, message, toast]);

  const handleRefresh = async () => {
    try {
      await dispatch(loadAuditLogs({ page: 0, size: pageSize })).unwrap();
      toast('Logs refreshed successfully', 'success');
    } catch (err) {
      toast(err?.message || 'Failed to refresh logs', 'error');
    }
  };

  /* ── Pagination page change → call backend ── */
  const handlePageChange = (newPage) => {
    fetchPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Derived stats from current page only ── */
  const today          = new Date().toDateString();
  const todayLogs      = logs.filter((l) => new Date(l.timestamp).toDateString() === today).length;
  const uniqueEntities = [...new Set(logs.map((l) => l.entityName))].length;
  const uniqueUsers    = [...new Set(logs.map((l) => l.performedBy))].length;

  /* ── Filter options (built from current page's data) ── */
  const actions  = ['ALL', ...new Set(logs.map((l) => l.action))];
  const entities = ['ALL', ...new Set(logs.map((l) => l.entityName))];

  /* ── Client-side filtering on current page's 10 records ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter((l) => {
      const matchSearch =
        !q ||
        String(l.entityName).toLowerCase().includes(q) ||
        String(l.action).toLowerCase().includes(q)     ||
        String(l.performedBy).includes(q)              ||
        String(l.entityId).includes(q);
      const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
      const matchEntity = entityFilter === 'ALL' || l.entityName === entityFilter;
      return matchSearch && matchAction && matchEntity;
    });
  }, [logs, search, actionFilter, entityFilter]);

  /* ── Columns ── */
  const columns = useMemo(() => buildColumns(setSelectedLog), []);

  return (
    <div className="al-page">
      <div className="al-header">
        <h1 className="al-title">Audit Logs</h1>
        <p className="al-subtitle">Track all system activities and administrative actions</p>
      </div>

      {/* Stats — totalElements comes from backend for accurate total count */}
      <div className="al-stats-row">
        <StatCard icon="fa-clipboard-list" count={totalElements}   label="Total Logs"       colorClass="blue"   />
        <StatCard icon="fa-pen-to-square"  count={todayLogs}       label="Today's Activity" colorClass="green"  />
        <StatCard icon="fa-database"       count={uniqueEntities}  label="Entities Tracked" colorClass="purple" />
        <StatCard icon="fa-users"          count={uniqueUsers}     label="Unique Users"     colorClass="orange" />
      </div>

      <div className="al-card">
        <div className="al-card-top">
          <div className="al-card-heading">
            <i className="fa-solid fa-clipboard-list"></i> System Audit Trail
          </div>
          <div className="al-card-actions">
            <button className="al-export-btn" onClick={() => exportToCSV(filtered, toast)}>
              <i className="fa-solid fa-file-csv"></i> Export CSV
            </button>
            <button className="al-refresh-btn" onClick={handleRefresh} disabled={isLoading}>
              <i className={`fa-solid fa-rotate-right ${isLoading ? 'fa-spin' : ''}`}></i> Refresh
            </button>
          </div>
        </div>

        {/* Filters (applied on current page's data) */}
        <div className="al-filters-row">
          <select className="al-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
            {actions.map((a) => (
              <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a}</option>
            ))}
          </select>
          <select className="al-select" value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}>
            {entities.map((e) => (
              <option key={e} value={e}>{e === 'ALL' ? 'All Entities' : e}</option>
            ))}
          </select>
        </div>

        <div className="al-search-wrap">
          <i className="fa-solid fa-magnifying-glass al-search-icon"></i>
          <input
            className="al-search"
            placeholder="Search by entity name, action, user ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* DataTable — pagination is now handled BELOW by ServerPagination, not inside DataTable */}
        <DataTable
          data={filtered}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No audit logs found"
          rowKey="logId"
          itemsPerPage={pageSize}   // matches backend page size — so DataTable shows all 10 without splitting
        />

        {/* Server-side pagination controls */}
        <ServerPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>

      {selectedLog && (
        <ViewLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}