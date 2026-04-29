import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadNotifications, reset } from '../slice/notificationsSlice';
import { Spinner } from '../../../../components/common';
import { useToast } from '../../../../hooks/useToast';
import '../css/NotificationsPage.css';

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const ITEMS_PER_PAGE = 10;

/* ── Type Badge ── */
function TypeBadge({ type }) {
  const map = {
    RECHARGE:     'nb-badge--recharge',
    OFFER:        'nb-badge--offer',
    ALERT:        'nb-badge--alert',
    SYSTEM:       'nb-badge--system',
    PLAN_EXPIRY:  'nb-badge--expiry',
    REFUND:       'nb-badge--refund',
  };
  return (
    <span className={`nb-badge ${map[type] || 'nb-badge--system'}`}>
      {type}
    </span>
  );
}

/* ── Read Status Badge ── */
function ReadBadge({ read }) {
  return read
    ? <span className="nb-read-badge nb-read-badge--read"><i className="fa-solid fa-check-double"></i> Read</span>
    : <span className="nb-read-badge nb-read-badge--unread"><i className="fa-solid fa-circle"></i> Unread</span>;
}

/* ── Stat Card ── */
function StatCard({ icon, count, label, colorClass }) {
  return (
    <div className={`nb-stat-card nb-stat--${colorClass}`}>
      <div className="nb-stat-icon"><i className={`fa-solid ${icon}`}></i></div>
      <p className="nb-stat-count">{count}</p>
      <p className="nb-stat-label">{label}</p>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="nb-pagination">
      <button className="nb-page-btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      {pages.map((p) => (
        <button key={p} className={`nb-page-btn ${p === page ? 'nb-page-btn--active' : ''}`} onClick={() => onPageChange(p)}>
          {p}
        </button>
      ))}
      <button className="nb-page-btn" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  );
}

/* ── Main Page ── */
export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { data: notifications, isLoading, isError, message } = useSelector((state) => state.adminNotifications);
  const { accessToken } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [readFilter, setReadFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (accessToken) {
      dispatch(loadNotifications());
    }
    return () => {
      dispatch(reset());
    };
  }, [dispatch, accessToken]);

  // Handle errors from the initial Redux data load
  useEffect(() => {
    if (isError && message) {
      toast(message || 'An error occurred', 'error');
    }
  }, [isError, message, toast]);

  const handleRefresh = async () => {
    try {
      await dispatch(loadNotifications()).unwrap();
      toast('Notifications refreshed successfully', 'success');
    } catch (err) {
      toast(err?.message || 'Failed to refresh notifications', 'error');
    }
  };

  /* ── Derived stats ── */
  const total   = notifications.length;
  const read    = notifications.filter(n => n.readStatus).length;
  const unread  = notifications.filter(n => !n.readStatus).length;
  const today   = new Date().toDateString();
  const todayCt = notifications.filter(n => new Date(n.sentAt).toDateString() === today).length;

  /* ── Filter options ── */
  const types = ['ALL', ...new Set(notifications.map(n => n.type))];

  /* ── Filtered & paginated data ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notifications.filter(n => {
      const matchSearch =
        !q ||
        String(n.message).toLowerCase().includes(q) ||
        String(n.type).toLowerCase().includes(q) ||
        String(n.userId).includes(q);
      const matchType = typeFilter === 'ALL' || n.type === typeFilter;
      const matchRead =
        readFilter === 'ALL' ||
        (readFilter === 'READ' && n.readStatus) ||
        (readFilter === 'UNREAD' && !n.readStatus);
      return matchSearch && matchType && matchRead;
    });
  }, [notifications, search, typeFilter, readFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleFilter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  return (
    <div className="nb-page">
      <div className="nb-header">
        <h1 className="nb-title">Notifications</h1>
        <p className="nb-subtitle">Monitor all system notifications sent to users</p>
      </div>

      <div className="nb-stats-row">
        <StatCard icon="fa-bell"         count={total}   label="Total Sent"     colorClass="blue" />
        <StatCard icon="fa-check-double" count={read}    label="Read"           colorClass="green" />
        <StatCard icon="fa-circle"       count={unread}  label="Unread"         colorClass="orange" />
        <StatCard icon="fa-paper-plane"  count={todayCt} label="Sent Today"     colorClass="purple" />
      </div>

      <div className="nb-card">
        <div className="nb-card-top">
          <div className="nb-card-heading"><i className="fa-solid fa-bell"></i> All Notifications</div>
          <button className="nb-refresh-btn" onClick={handleRefresh}>
            <i className="fa-solid fa-rotate-right"></i> Refresh
          </button>
        </div>

        <div className="nb-filters-row">
          <select className="nb-select" value={typeFilter} onChange={handleFilter(setTypeFilter)}>
            {types.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>)}
          </select>
          <select className="nb-select" value={readFilter} onChange={handleFilter(setReadFilter)}>
            <option value="ALL">All Status</option>
            <option value="READ">Read</option>
            <option value="UNREAD">Unread</option>
          </select>
        </div>

        <div className="nb-search-wrap">
          <i className="fa-solid fa-magnifying-glass nb-search-icon"></i>
          <input
            className="nb-search"
            placeholder="Search by message, type, user ID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {isLoading ? (
          <div className="nb-center"><Spinner /></div>
        ) : paginated.length === 0 ? (
          <div className="nb-empty"><i className="fa-solid fa-bell-slash"></i><p>No notifications found</p></div>
        ) : (
          <>
            <div className="nb-table-wrap">
              <table className="nb-table">
                <thead>
                  <tr>
                    <th>USER ID</th><th>TYPE</th><th>MESSAGE</th><th>SENT AT</th><th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((n, i) => (
                    <tr key={n.notificationId ?? i} className={!n.readStatus ? 'nb-row--unread' : ''}>
                      <td><span className="nb-user-chip"><i className="fa-solid fa-user"></i> #{n.userId}</span></td>
                      <td><TypeBadge type={n.type} /></td>
                      <td className="nb-message-cell">{n.message || '—'}</td>
                      <td className="nb-timestamp">{formatDateTime(n.sentAt)}</td>
                      <td><ReadBadge read={n.readStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="nb-table-footer">
              <p className="nb-count-text">
                Showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} notifications
              </p>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}