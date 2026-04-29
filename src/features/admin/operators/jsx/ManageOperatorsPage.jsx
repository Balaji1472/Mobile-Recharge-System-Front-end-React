import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminLayout from "../../../../components/AdminLayout/AdminLayout";
import { Spinner } from "../../../../components/common";
import { useToast } from "../../../../hooks/useToast";
import { loadOperators, addOperator, editOperator, changeOperatorStatus } from "../slice/operatorsSlice";
import "../css/ManageOperatorsPage.css";

/* ── Operator logo map (local assets) ── */
import airtelLogo from "../../../../assets/operators/airtel-logo.webp";
import jioLogo from "../../../../assets/operators/Jio-logo.webp";
import viLogo from "../../../../assets/operators/VI-logo.webp";
import bsnlLogo from "../../../../assets/operators/Bsnl-logo.webp";

const LOGO_MAP = {
  AIRTEL: airtelLogo,
  JIO: jioLogo,
  VI: viLogo,
  BSNL: bsnlLogo,
};

const ITEMS_PER_PAGE = 8;

/* ── Helpers ── */
function getLogo(name) {
  return LOGO_MAP[(name || "").toUpperCase()] ?? null;
}

function OperatorLogo({ name, className, fallbackClass }) {
  const src = getLogo(name);
  if (src) return <img src={src} alt={name} className={className} />;
  return (
    <div className={fallbackClass}>
      {(name || "?").slice(0, 2).toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === "ACTIVE";
  return (
    <span
      className={`mo-badge ${active ? "mo-badge--active" : "mo-badge--inactive"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function AddOperatorModal({ onClose }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { isSaving } = useSelector((state) => state.operators);

  const [name, setName] = useState("");
  const [nameErr, setNameErr] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      setNameErr("Operator name is required");
      return;
    }

    const result = await dispatch(
      addOperator({ operatorName: name.trim(), status: "ACTIVE" }),
    );

    if (addOperator.fulfilled.match(result)) {
      toast("Operator added successfully!", "success");
      onClose();
    } else {
      toast(result.payload || "Error adding operator", "error");
    }
  };

  return (
    <div className="mo-overlay" onClick={onClose}>
      <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mo-modal-header">
          <div>
            <p className="mo-modal-title">Add Operator</p>
            <p className="mo-modal-hint">Register a new network operator</p>
          </div>
          <button className="mo-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="mo-modal-body">
          <div className="mo-field">
            <label className="mo-label">
              Operator Name <span>*</span>
            </label>
            <input
              className={`mo-input${nameErr ? " error" : ""}`}
              placeholder="e.g. Airtel, Jio, Vi, BSNL"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameErr("");
              }}
            />
            {nameErr && <span className="mo-error-text">{nameErr}</span>}
          </div>
        </div>

        <div className="mo-modal-footer">
          <button className="mo-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="mo-btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" /> Saving…
              </>
            ) : (
              <>
                <i className="fa-solid fa-check" /> Add Operator
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditOperatorModal({ operator, onClose }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { isSaving } = useSelector((state) => state.operators);

  const [name, setName] = useState(operator.operatorName);
  const [nameErr, setNameErr] = useState("");

  const isActive = operator.status === "ACTIVE";

  const handleSave = async () => {
    if (!name.trim()) {
      setNameErr("Operator name is required");
      return;
    }

    const result = await dispatch(
      editOperator({
        operatorId: operator.operatorId,
        payload: { operatorName: name.trim(), status: operator.status },
      }),
    );

    if (editOperator.fulfilled.match(result)) {
      toast("Operator updated successfully!", "success");
      onClose();
    } else {
      toast(result.payload || "Failed to update operator", "error");
    }
  };

  const handleToggleStatus = async () => {
    const result = await dispatch(
      changeOperatorStatus({ operatorId: operator.operatorId, isActive }),
    );

    if (changeOperatorStatus.fulfilled.match(result)) {
      toast(
        `Operator ${isActive ? "deactivated" : "activated"} successfully!`,
        "success",
      );
      onClose();
    } else {
      toast(result.payload || "Failed to change status", "error");
    }
  };

  return (
    <div className="mo-overlay" onClick={onClose}>
      <div className="mo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mo-modal-header">
          <div>
            <p className="mo-modal-title">Edit Operator</p>
            <p className="mo-modal-hint">Update operator details and status</p>
          </div>
          <button className="mo-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="mo-modal-body">
          <div className="mo-op-preview">
            <OperatorLogo
              name={operator.operatorName}
              className="mo-op-preview-logo"
              fallbackClass="mo-op-preview-fallback"
            />
            <div>
              <p className="mo-op-preview-name">{operator.operatorName}</p>
              <p className="mo-op-preview-id">ID: #{operator.operatorId}</p>
            </div>
          </div>

          <div className="mo-field">
            <label className="mo-label">
              Operator Name <span>*</span>
            </label>
            <input
              className={`mo-input${nameErr ? " error" : ""}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameErr("");
              }}
            />
            {nameErr && <span className="mo-error-text">{nameErr}</span>}
          </div>

          <div className="mo-toggle-row">
            <div>
              <p className="mo-toggle-label">Status</p>
              <p className="mo-toggle-hint">
                {isActive
                  ? "Deactivating will block new plan creation"
                  : "Activate to allow plan assignment"}
              </p>
            </div>
            <button
              className={`mo-btn-activate ${isActive ? "mo-btn-activate--on" : "mo-btn-activate--off"}`}
              onClick={handleToggleStatus}
              disabled={isSaving}
            >
              {isSaving ? (
                <i className="fa-solid fa-spinner fa-spin" />
              ) : isActive ? (
                "Active"
              ) : (
                "Inactive"
              )}
            </button>
          </div>
        </div>

        <div className="mo-modal-footer">
          <button className="mo-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="mo-btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" /> Saving…
              </>
            ) : (
              <>
                <i className="fa-solid fa-check" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
export default function ManageOperatorsPage({ sidebarOpen, onSidebarClose }) {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { operators, isLoading } = useSelector((state) => state.operators);

  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'add' | operatorObj

  useEffect(() => {
    const fetch = async () => {
      const result = await dispatch(loadOperators());
      if (loadOperators.rejected.match(result)) {
        toast(result.payload || "Error fetching operators", "error");
      }
    };
    fetch();
  }, [dispatch]);

  const totalPages = Math.max(1, Math.ceil(operators.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = operators.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      <div className="mo-page">
        <div className="mo-header">
          <h1 className="mo-title">Manage Operators</h1>
          <p className="mo-subtitle">
            Add, edit or remove network operators from the platform
          </p>
        </div>

        <div className="mo-card">
          <div className="mo-card-top">
            <div className="mo-card-heading">
              <i className="fa-solid fa-tower-broadcast" />
              <span>Network Operators</span>
            </div>
            <button className="mo-btn-add" onClick={() => setModal("add")}>
              <i className="fa-solid fa-plus" /> Add Operator
            </button>
          </div>
          <hr className="mo-card-divider" />

          {isLoading ? (
            <div className="mo-loading">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="mo-table-wrap">
                <table className="mo-table">
                  <thead>
                    <tr>
                      <th>Logo</th>
                      <th>Operator Name</th>
                      <th>Total Plans</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="mo-empty">
                          No operators found
                        </td>
                      </tr>
                    ) : (
                      paginated.map((op) => (
                        <tr key={op.operatorId}>
                          <td>
                            <OperatorLogo
                              name={op.operatorName}
                              className="mo-logo"
                              fallbackClass="mo-logo-fallback"
                            />
                          </td>
                          <td className="mo-op-name">{op.operatorName}</td>
                          <td>{op.totalPlans ?? "—"}</td>
                          <td>
                            <StatusBadge status={op.status} />
                          </td>
                          <td>
                            <button
                              className="mo-btn-edit"
                              onClick={() => setModal(op)}
                            >
                              <i className="fa-solid fa-pen" /> Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mo-pagination">
                  <button
                    className="mo-pg-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`mo-pg-btn${currentPage === n ? " mo-pg-btn--active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className="mo-pg-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                  <span className="mo-pg-info">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, operators.length)}{" "}
                    of {operators.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal === "add" && <AddOperatorModal onClose={() => setModal(null)} />}
      {modal && modal !== "add" && (
        <EditOperatorModal operator={modal} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
