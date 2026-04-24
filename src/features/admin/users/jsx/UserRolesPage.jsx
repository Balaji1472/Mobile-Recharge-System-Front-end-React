import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadRoleCounts } from '../slice/usersSlice';
import { Spinner } from '../../../../components/common';
import '../css/UserRolesPage.css';

/* ── Role meta config ── */
const ROLE_META = {
  ADMIN: {
    icon:        'fa-shield-halved',
    description: 'Full platform access — manage users, plans, operators, offers, and system settings.',
    accent:      'red',
  },
  USER: {
    icon:        'fa-user',
    description: 'Standard registered user who can recharge and view transaction history.',
    accent:      'blue',
  },
};

function getRoleMeta(roleName) {
  return ROLE_META[roleName] || {
    icon:        'fa-user-tag',
    description: 'Platform role with assigned access permissions.',
    accent:      'gray',
  };
}


/* ─────────────────────────────────────────
   Main page
───────────────────────────────────────── */
export default function UserRolesPage() {
  const dispatch = useDispatch();

  const { roles, rolesLoading: isLoading, rolesError: isError, rolesMessage: message } = useSelector((state) => state.users);

  /* ── fetch on mount ── */
  useEffect(() => {
    dispatch(loadRoleCounts());
  }, [dispatch]);

  const totalUsers = roles.reduce((sum, r) => sum + Number(r.count), 0);

  return (
    <div>
      <div className="ur-page">

        {/* Page Header */}
        <div className="ur-header">
          <h1 className="ur-title">User Roles</h1>
          <p className="ur-subtitle">Overview of roles and user distribution on the platform</p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="ur-state-row">
            <Spinner size="md" />
            <span>Loading role data...</span>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="ur-error-row">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{message}</span>
          </div>
        )}

        {/* Content */}
        {!isLoading && !isError && (
          <>
            {/* Role Cards */}
            <div className="ur-roles-grid">
              {roles.map((role) => {
                const meta = getRoleMeta(role.roleName);
                const pct  = totalUsers > 0 ? Math.round((role.count / totalUsers) * 100) : 0;

                return (
                  <div key={role.roleName} className={`ur-role-card ur-role-${meta.accent}`}>
                    <div className="ur-role-top">
                      <div className={`ur-role-icon ur-icon-${meta.accent}`}>
                        <i className={`fa-solid ${meta.icon}`}></i>
                      </div>
                      <div className="ur-role-info">
                        <h2 className="ur-role-name">{role.roleName}</h2>
                        <p className="ur-role-desc">{meta.description}</p>
                      </div>
                    </div>

                    <hr className="ur-role-divider" />

                    <div className="ur-role-stats">
                      <div className="ur-stat">
                        <span className="ur-stat-value">{role.count}</span>
                        <span className="ur-stat-label">Total Users</span>
                      </div>
                      <div className="ur-stat">
                        <span className="ur-stat-value">{pct}%</span>
                        <span className="ur-stat-label">of Platform</span>
                      </div>
                    </div>

                    {/* Distribution bar */}
                    <div className="ur-bar-wrap">
                      <div className="ur-bar-track">
                        <div
                          className={`ur-bar-fill ur-bar-${meta.accent}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <span className="ur-bar-pct">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary Table */}
            <div className="ur-summary-card">
              <div className="ur-summary-header">
                <span className="ur-summary-icon">
                  <i className="fa-solid fa-chart-pie"></i>
                </span>
                <h3 className="ur-summary-title">Role Distribution Summary</h3>
              </div>
              <hr className="ur-role-divider" />

              <div className="ur-summary-table-wrap">
                <table className="ur-summary-table">
                  <thead>
                    <tr>
                      <th>ROLE</th>
                      <th>USERS</th>
                      <th>SHARE</th>
                      <th>DISTRIBUTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role) => {
                      const meta = getRoleMeta(role.roleName);
                      const pct  = totalUsers > 0 ? Math.round((role.count / totalUsers) * 100) : 0;
                      return (
                        <tr key={role.roleName}>
                          <td>
                            <span className={`ur-tbl-badge ur-tbl-badge--${meta.accent}`}>
                              <i className={`fa-solid ${meta.icon}`}></i>
                              {role.roleName}
                            </span>
                          </td>
                          <td className="ur-tbl-count">{role.count}</td>
                          <td className="ur-tbl-pct">{pct}%</td>
                          <td className="ur-tbl-bar-cell">
                            <div className="ur-bar-track ur-tbl-bar">
                              <div
                                className={`ur-bar-fill ur-bar-${meta.accent}`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Total row */}
                    <tr className="ur-tbl-total">
                      <td><strong>Total</strong></td>
                      <td><strong>{totalUsers}</strong></td>
                      <td><strong>100%</strong></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}