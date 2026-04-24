import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadAuditLogs, resetAuditLogs } from '../slice/auditLogsSlice';
import { Spinner } from '../../../../components/common';
import { useToast } from '../../../../hooks/useToast';
import '../css/AuditLogsPage.css';

/* ── helpers ─────────────────────────────────────────── */
function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

const ITEMS_PER_PAGE = 10;

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
          <button className="al-modal-close" onClick={onClose}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="al-modal-body">
          <div className="al-modal-badge-row"><ActionBadge action={log.action} /></div>
          <hr className="al-modal-divider" />
          <div className="al-detail-grid">
            <DetailRow icon="fa-user" label="Performed By" value={`User #${log.performedBy}`} />
            <DetailRow icon="fa-database" label="Entity" value={log.entityName} />
            <DetailRow icon="fa-hashtag" label="Entity ID" value={log.entityId} />
            <DetailRow icon="fa-clock" label="Timestamp" value={formatDateTime(log.timestamp)} />
            <DetailRow icon="fa-arrow-left" label="Old Value" value={log.oldValue || '—'} />
            <DetailRow icon="fa-arrow-right" label="New Value" value={log.newValue || '—'} />
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

/* ── Pagination ── */
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="al-pagination">
      <button className="al-page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      {pages.map((p) => (
        <button key={p} className={`al-page-btn ${p === page ? 'al-page-btn--active' : ''}`} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}
      <button className="al-page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
}

/* ── Main Page ── */
export default function AuditLogsPage() {
  const dispatch = useDispatch();
  
  // Use destructuring with an alias if your hook returns { showToast: ... }
  // This avoids conflicts with any Redux actions named showToast
  const { toast } = useToast(); 
  
  const { data: logs, isLoading, isError, message } = useSelector((state) => state.auditLogs);
  const { accessToken } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    if (accessToken) {
      dispatch(loadAuditLogs());
    }
    return () => { dispatch(resetAuditLogs()); };
  }, [dispatch, accessToken]);

  // Handle errors from the initial Redux data load
  useEffect(() => {
    if (isError && message) {
      toast(message, 'error');
    }
  }, [isError, message, toast]);

  const handleRefresh = async () => {
    try {
      await dispatch(loadAuditLogs()).unwrap();
      toast('Logs refreshed successfully', 'success');
    } catch (err) {
      toast(err?.message || 'Failed to refresh logs', 'error');
    }
  };

  /* ── Derived stats ── */
  const today = new Date().toDateString();
  const totalLogs = logs.length;
  const todayLogs = logs.filter(l => new Date(l.timestamp).toDateString() === today).length;
  const uniqueEntities = [...new Set(logs.map(l => l.entityName))].length;
  const uniqueUsers = [...new Set(logs.map(l => l.performedBy))].length;

  const actions = ['ALL', ...new Set(logs.map(l => l.action))];
  const entities = ['ALL', ...new Set(logs.map(l => l.entityName))];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return logs.filter(l => {
      const matchSearch = !q || 
        String(l.entityName).toLowerCase().includes(q) || 
        String(l.action).toLowerCase().includes(q) || 
        String(l.performedBy).includes(q) || 
        String(l.entityId).includes(q);
      const matchAction = actionFilter === 'ALL' || l.action === actionFilter;
      const matchEntity = entityFilter === 'ALL' || l.entityName === entityFilter;
      return matchSearch && matchAction && matchEntity;
    });
  }, [logs, search, actionFilter, entityFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleExport = () => {
    try {
      if (!filtered || filtered.length === 0) {
        toast('No logs available to export', 'error');
        return;
      }

      const rows = [
        ['Entity Name', 'Entity ID', 'Action', 'Performed By', 'Old Value', 'New Value', 'Timestamp'],
        ...filtered.map(l => [
          l.entityName, 
          l.entityId, 
          l.action, 
          l.performedBy, 
          l.oldValue || '', 
          l.newValue || '', 
          formatDateTime(l.timestamp)
        ]),
      ];
      
      const csv = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; 
      a.download = 'audit-logs.csv'; 
      a.click();
      URL.revokeObjectURL(url); // Clean up memory
      
      toast('Audit logs exported successfully', 'success');
    } catch (err) {
      toast('Export failed. Please try again.', 'error');
    }
  };

  const handleFilterChange = (setter) => (e) => { setter(e.target.value); setPage(1); };

  return (
    <div className="al-page">
      <div className="al-header">
        <h1 className="al-title">Audit Logs</h1>
        <p className="al-subtitle">Track all system activities and administrative actions</p>
      </div>

      <div className="al-stats-row">
        <StatCard icon="fa-clipboard-list" count={totalLogs} label="Total Logs" colorClass="blue" />
        <StatCard icon="fa-pen-to-square" count={todayLogs} label="Today's Activity" colorClass="green" />
        <StatCard icon="fa-database" count={uniqueEntities} label="Entities Tracked" colorClass="purple" />
        <StatCard icon="fa-users" count={uniqueUsers} label="Unique Users" colorClass="orange" />
      </div>

      <div className="al-card">
        <div className="al-card-top">
          <div className="al-card-heading"><i className="fa-solid fa-clipboard-list"></i> System Audit Trail</div>
          <div className="al-card-actions">
            <button className="al-export-btn" onClick={handleExport}><i className="fa-solid fa-file-csv"></i> Export CSV</button>
            <button className="al-refresh-btn" onClick={handleRefresh}><i className="fa-solid fa-rotate-right"></i> Refresh</button>
          </div>
        </div>

        <div className="al-filters-row">
          <select className="al-select" value={actionFilter} onChange={handleFilterChange(setActionFilter)}>
            {actions.map(a => <option key={a} value={a}>{a === 'ALL' ? 'All Actions' : a}</option>)}
          </select>
          <select className="al-select" value={entityFilter} onChange={handleFilterChange(setEntityFilter)}>
            {entities.map(e => <option key={e} value={e}>{e === 'ALL' ? 'All Entities' : e}</option>)}
          </select>
        </div>

        <div className="al-search-wrap">
          <i className="fa-solid fa-magnifying-glass al-search-icon"></i>
          <input className="al-search" placeholder="Search by entity name, action, user ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>

        {isLoading ? (
          <div className="al-center"><Spinner /></div>
        ) : paginated.length === 0 ? (
          <div className="al-empty"><i className="fa-solid fa-inbox"></i><p>No audit logs found</p></div>
        ) : (
          <>
            <div className="al-table-wrap">
              <table className="al-table">
                <thead>
                  <tr>
                    <th>ENTITY NAME</th><th>ENTITY ID</th><th>ACTION</th><th>PERFORMED BY</th><th>OLD VALUE</th><th>NEW VALUE</th><th>TIMESTAMP</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log, i) => (
                    <tr key={log.id ?? log.logId ?? i}>
                      <td className="al-entity-name">{log.entityName}</td>
                      <td>{log.entityId}</td>
                      <td><ActionBadge action={log.action} /></td>
                      <td><span className="al-user-chip"><i className="fa-solid fa-user"></i> #{log.performedBy}</span></td>
                      <td className="al-value-cell">{log.oldValue || '—'}</td>
                      <td className="al-value-cell">{log.newValue || '—'}</td>
                      <td className="al-timestamp">{formatDateTime(log.timestamp)}</td>
                      <td><button className="al-view-btn" onClick={() => setSelectedLog(log)}><i className="fa-solid fa-eye"></i></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="al-table-footer">
              <p className="al-count-text">Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} logs</p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
      {selectedLog && <ViewLogModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  );
}