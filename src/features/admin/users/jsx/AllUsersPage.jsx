import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUsers, changeUserStatus } from '../slice/usersSlice';
import { useToast } from '../../../../hooks/useToast';
import { Button, Spinner } from '../../../../components/common';
import DataTable from '../../../../components/common/DataTable/DataTable'; // ← reusable table
import '../css/AllUsersPage.css';

/* ── helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/* ── Status Badge ── */
function StatusBadge({ status }) {
  const cls =
    status === 'ACTIVE'  ? 'um-badge--active'
    : status === 'BLOCKED' ? 'um-badge--blocked'
    : 'um-badge--inactive';
  return <span className={`um-badge ${cls}`}>{status}</span>;
}

/* ── Detail Row (used inside modal only) ── */
function DetailRow({ icon, label, value }) {
  return (
    <div className="um-detail-row">
      <span className="um-detail-label">
        <i className={`fa-solid ${icon}`}></i>
        {label}
      </span>
      <span className="um-detail-value">{value || '—'}</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   View / Block modal  (unchanged logic)
───────────────────────────────────────── */
function ViewUserModal({ user, onClose }) {
  const dispatch           = useDispatch();
  const { toast }          = useToast();
  const { statusUpdating } = useSelector((state) => state.users);

  if (!user) return null;

  const isBlocked = user.status === 'BLOCKED';

  const handleToggle = async () => {
    const newStatus = isBlocked ? 'ACTIVE' : 'BLOCKED';
    const result    = await dispatch(changeUserStatus({ userId: user.userId, status: newStatus }));

    if (changeUserStatus.fulfilled.match(result)) {
      toast(
        isBlocked ? 'User unblocked successfully' : 'User blocked successfully',
        'success',
      );
      onClose();
    } else {
      toast(result.payload || 'Failed to update status', 'error');
    }
  };

  return (
    <div className="um-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="um-modal-header">
          <div className="um-modal-title-group">
            <h3 className="um-modal-title">User Details</h3>
            <p className="um-modal-hint">Read-only profile information</p>
          </div>
          <button className="um-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Body */}
        <div className="um-modal-body">

          {/* Avatar + name */}
          <div className="um-modal-avatar-row">
            <div className="um-modal-avatar">
              {user.fullName
                ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                : 'U'}
            </div>
            <div>
              <p className="um-modal-name">{user.fullName || '—'}</p>
              <StatusBadge status={user.status} />
            </div>
          </div>

          <hr className="um-modal-divider" />

          <div className="um-detail-grid">
            <DetailRow icon="fa-envelope"     label="Email"   value={user.email} />
            <DetailRow icon="fa-phone"        label="Mobile"  value={user.mobileNumber} />
            <DetailRow
              icon="fa-venus-mars"
              label="Gender"
              value={user.gender ? user.gender.charAt(0) + user.gender.slice(1).toLowerCase() : '—'}
            />
            <DetailRow icon="fa-user-tag"     label="Role"   value={user.role} />
            <DetailRow icon="fa-calendar"     label="Joined" value={formatDate(user.created_at)} />
            <DetailRow icon="fa-circle-check" label="Status" value={user.status} />
          </div>

          <hr className="um-modal-divider" />

          <div className="um-modal-actions">
            <button className="um-btn-cancel" onClick={onClose}>Close</button>
            <Button
              variant={isBlocked ? 'primary' : 'danger'}
              isLoading={statusUpdating}
              onClick={handleToggle}
            >
              {!statusUpdating && (
                <i className={`fa-solid ${isBlocked ? 'fa-circle-check' : 'fa-ban'} me-2`}></i>
              )}
              {isBlocked ? 'Unblock User' : 'Block User'}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Column definitions for Users table
───────────────────────────────────────── */
function buildColumns({ blockingId, onView, onQuickBlock }) {
  return [
    {
      key: 'fullName',
      label: 'Name',
      sortable: true,
      render: (val) => <span className="um-td-name">{val || '—'}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (val) => <span className="um-td-email">{val || '—'}</span>,
    },
    {
      key: 'mobileNumber',
      label: 'Phone',
      sortable: false,
      render: (val) => val || '—',
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'created_at',
      label: 'Joined Date',
      sortable: true,
      isTimestamp: true,       // ← latest joined shown first by default
      render: (val) => formatDate(val),
    },
    {
      key: '_actions',
      label: 'Actions',
      width: '160px',
      align: 'center',
      render: (_, row) => (
        <div className="um-action-btns">
          {/* View */}
          <button className="um-btn-view" onClick={() => onView(row)}>
            <i className="fa-solid fa-eye"></i>
            View
          </button>

          {/* Block / Unblock */}
          <Button
            variant={row.status === 'BLOCKED' ? 'primary' : 'danger'}
            isLoading={blockingId === row.userId}
            onClick={() => onQuickBlock(row)}
          >
            {blockingId !== row.userId && (
              <i className={`fa-solid ${row.status === 'BLOCKED' ? 'fa-circle-check' : 'fa-ban'} me-2`}></i>
            )}
            {row.status === 'BLOCKED' ? 'Unblock' : 'Block'}
          </Button>
        </div>
      ),
    },
  ];
}

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function AllUsersPage() {
  const dispatch  = useDispatch();
  const { toast } = useToast();

  const { data: users, isLoading, isError, message } = useSelector((state) => state.users);

  const [search,       setSearch]       = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockingId,   setBlockingId]   = useState(null);

  /* ── fetch on mount ── */
  useEffect(() => {
    dispatch(loadUsers());
  }, [dispatch]);

  /* ── client-side search filter (lives on page, not in DataTable) ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobileNumber?.includes(q),
    );
  }, [users, search]);

  /* ── inline block / unblock handler ── */
  const handleQuickBlock = async (user) => {
    const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    setBlockingId(user.userId);

    const result = await dispatch(changeUserStatus({ userId: user.userId, status: newStatus }));

    if (changeUserStatus.fulfilled.match(result)) {
      toast(
        newStatus === 'BLOCKED' ? 'User blocked successfully' : 'User unblocked successfully',
        'success',
      );
    } else {
      toast(result.payload || 'Failed to update status', 'error');
    }

    setBlockingId(null);
  };

  /* ── columns — rebuild only when blockingId changes (for loading state) ── */
  const columns = useMemo(
    () =>
      buildColumns({
        blockingId,
        onView:       (row) => setSelectedUser(row),
        onQuickBlock: handleQuickBlock,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blockingId],
  );

  return (
    <div>
      <div className="um-page">

        {/* Page header */}
        <div className="um-header">
          <h1 className="um-title">User Management</h1>
          <p className="um-subtitle">Manage all registered users on the platform</p>
        </div>

        {/* Card */}
        <div className="um-card">

          {/* Card top row */}
          <div className="um-card-top">
            <div className="um-card-heading">
              <i className="fa-solid fa-users"></i>
              <span>All Users</span>
              {!isLoading && <span className="um-count">( {filtered.length} )</span>}
            </div>
          </div>

          <hr className="um-card-divider" />

          {/* Search — stays on the page, not inside DataTable */}
          <div className="um-search-wrap">
            <i className="fa-solid fa-magnifying-glass um-search-icon"></i>
            <input
              className="um-search"
              type="text"
              placeholder="Search user by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="um-search-clear" onClick={() => setSearch('')}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          {/* Error state */}
          {isError && !isLoading && (
            <div className="um-error-row">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{message}</span>
            </div>
          )}

          {/* ↓ DataTable — receives already-filtered data */}
          {!isError && (
            <DataTable
              data={filtered}
              columns={columns}
              isLoading={isLoading}
              emptyMessage={search ? `No users found for "${search}"` : 'No users found'}
              rowKey="userId"
              itemsPerPage={8}
            />
          )}

        </div>
      </div>

      {/* View / block modal */}
      {selectedUser && (
        <ViewUserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}