import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadUsers, changeUserStatus } from '../slice/usersSlice';
import { useToast } from '../../../../hooks/useToast';
import { Button, Spinner } from '../../../../components/common';
import '../css/AllUsersPage.css';

/* ── helpers ── */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const cls = status === 'ACTIVE'  ? 'um-badge--active'
            : status === 'BLOCKED' ? 'um-badge--blocked'
            : 'um-badge--inactive';
  return <span className={`um-badge ${cls}`}>{status}</span>;
}

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

const ITEMS_PER_PAGE = 8;


/* ─────────────────────────────────────────
   View / Block modal
───────────────────────────────────────── */
function ViewUserModal({ user, onClose }) {
  const dispatch    = useDispatch();
  const { toast }   = useToast();
  const { statusUpdating } = useSelector((state) => state.users);

  if (!user) return null;

  const isBlocked = user.status === 'BLOCKED';

  const handleToggle = async () => {
    const newStatus = isBlocked ? 'ACTIVE' : 'BLOCKED';
    const result    = await dispatch(changeUserStatus({ userId: user.userId, status: newStatus }));

    if (changeUserStatus.fulfilled.match(result)) {
      toast(
        isBlocked ? 'User unblocked successfully' : 'User blocked successfully',
        'success'
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

          {/* Info rows */}
          <div className="um-detail-grid">
            <DetailRow icon="fa-envelope"     label="Email"   value={user.email} />
            <DetailRow icon="fa-phone"        label="Mobile"  value={user.mobileNumber} />
            <DetailRow
              icon="fa-venus-mars"
              label="Gender"
              value={user.gender ? user.gender.charAt(0) + user.gender.slice(1).toLowerCase() : '—'}
            />
            <DetailRow icon="fa-user-tag"     label="Role"    value={user.role} />
            <DetailRow icon="fa-calendar"     label="Joined"  value={formatDate(user.created_at)} />
            <DetailRow icon="fa-circle-check" label="Status"  value={user.status} />
          </div>

          <hr className="um-modal-divider" />

          {/* Actions */}
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
   Main page
───────────────────────────────────────── */
export default function AllUsersPage() {
  const dispatch  = useDispatch();
  const { toast } = useToast();

  const { data: users, isLoading, isError, message } = useSelector((state) => state.users);

  const [search,       setSearch]       = useState('');
  const [page,         setPage]         = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockingId,   setBlockingId]   = useState(null); // tracks which row button is loading

  /* ── fetch on mount ── */
  useEffect(() => {
    dispatch(loadUsers());
  }, [dispatch]);

  /* ── search filter ── */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.mobileNumber?.includes(q)
    );
  }, [users, search]);

  /* ── reset page on search change ── */
  useEffect(() => { setPage(1); }, [search]);

  /* ── pagination ── */
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  /* ── inline block / unblock from table row ── */
  const handleQuickBlock = async (user) => {
    const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    setBlockingId(user.userId);

    const result = await dispatch(changeUserStatus({ userId: user.userId, status: newStatus }));

    if (changeUserStatus.fulfilled.match(result)) {
      toast(
        newStatus === 'BLOCKED' ? 'User blocked successfully' : 'User unblocked successfully',
        'success'
      );
    } else {
      toast(result.payload || 'Failed to update status', 'error');
    }

    setBlockingId(null);
  };

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

          {/* Search */}
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

          {/* Loading */}
          {isLoading && (
            <div className="um-state-row">
              <Spinner size="md" />
              <span>Loading users...</span>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="um-error-row">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <span>{message}</span>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && (
            <>
              {filtered.length === 0 ? (
                <div className="um-empty">
                  <i className="fa-solid fa-user-slash"></i>
                  <p>No users found{search ? ` for "${search}"` : ''}.</p>
                </div>
              ) : (
                <div className="um-table-wrap">
                  <table className="um-table">
                    <thead>
                      <tr>
                        <th>NAME</th>
                        <th>EMAIL</th>
                        <th>PHONE</th>
                        <th>STATUS</th>
                        <th>JOINED DATE</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginated.map((user) => (
                        <tr key={user.userId}>
                          <td className="um-td-name">{user.fullName || '—'}</td>
                          <td className="um-td-email">{user.email || '—'}</td>
                          <td>{user.mobileNumber || '—'}</td>
                          <td><StatusBadge status={user.status} /></td>
                          <td>{formatDate(user.created_at)}</td>
                          <td>
                            <div className="um-action-btns">
                              {/* View */}
                              <button
                                className="um-btn-view"
                                onClick={() => setSelectedUser(user)}
                              >
                                <i className="fa-solid fa-eye"></i>
                                View
                              </button>

                              {/* Block / Unblock */}
                              <Button
                                variant={user.status === 'BLOCKED' ? 'primary' : 'danger'}
                                isLoading={blockingId === user.userId}
                                onClick={() => handleQuickBlock(user)}
                              >
                                {blockingId !== user.userId && (
                                  <i className={`fa-solid ${user.status === 'BLOCKED' ? 'fa-circle-check' : 'fa-ban'} me-2`}></i>
                                )}
                                {user.status === 'BLOCKED' ? 'Unblock' : 'Block'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="um-pagination">
                  <button
                    className="um-pg-btn"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      className={`um-pg-btn ${page === p ? 'um-pg-btn--active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    className="um-pg-btn"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>

                  <span className="um-pg-info">
                    Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </span>
                </div>
              )}
            </>
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