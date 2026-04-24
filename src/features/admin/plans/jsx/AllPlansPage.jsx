import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loadPlans,
  loadOperators,
  loadCategories,
  editPlan,
  togglePlan,
  reset,
} from "../slice/plansSlice";
import { Spinner } from "../../../../components/common";
import { useToast } from "../../../../hooks/useToast";
import "../css/AllPlansPage.css";

const ITEMS_PER_PAGE = 8;

/* ── Status Badge ── */
function StatusBadge({ active }) {
  return (
    <span
      className={`pm-badge ${active ? "pm-badge--active" : "pm-badge--inactive"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ── Edit Modal ── */
function EditPlanModal({ plan, operators, categories, onClose, onSaved }) {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const [form, setForm] = useState({
    operatorId: plan.operatorId,
    categoryId: plan.categoryId,
    planName: plan.planName,
    price: plan.price,
    validityDays: plan.validityDays ?? "",
    dataBenefits: plan.dataBenefits ?? "",
    callBenefits: plan.callBenefits ?? "",
    smsBenefits: plan.smsBenefits ?? "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const err = {};
    if (!form.planName.trim()) err.planName = "Plan name is required";
    if (!form.price || Number(form.price) <= 0)
      err.price = "Enter a positive price";
    if (!form.validityDays || Number(form.validityDays) <= 0)
      err.validityDays = "Enter valid days";
    return err;
  };

  const handleSave = async () => {
    const err = validate();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setSaving(true);
    try {
      const updated = await dispatch(
        editPlan({
          planId: plan.planId,
          payload: {
            operatorId: Number(form.operatorId),
            categoryId: Number(form.categoryId),
            planName: form.planName.trim(),
            price: Number(form.price),
            validityDays: Number(form.validityDays),
            dataBenefits: form.dataBenefits,
            callBenefits: form.callBenefits,
            smsBenefits: form.smsBenefits,
          },
        }),
      ).unwrap();
      toast("Plan updated successfully!", "success");
      onSaved(updated);
    } catch (err) {
      toast(err || "Failed to update plan", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pm-modal-header">
          <div>
            <p className="pm-modal-title">Edit Plan</p>
            <p className="pm-modal-hint">Update plan details below</p>
          </div>
          <button className="pm-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="pm-form-grid">
          <div className="pm-field">
            <label className="pm-label">Category</label>
            <select
              className="pm-select"
              value={form.categoryId}
              onChange={set("categoryId")}
            >
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="pm-field">
            <label className="pm-label">Operator</label>
            <select
              className="pm-select"
              value={form.operatorId}
              onChange={set("operatorId")}
            >
              {operators.map((o) => (
                <option key={o.operatorId} value={o.operatorId}>
                  {o.operatorName}
                </option>
              ))}
            </select>
          </div>

          <div className="pm-field pm-full">
            <label className="pm-label">
              Plan Name <span>*</span>
            </label>
            <input
              className={`pm-input${errors.planName ? " error" : ""}`}
              value={form.planName}
              onChange={set("planName")}
              placeholder="Enter plan name"
            />
            {errors.planName && (
              <span className="pm-error-text">{errors.planName}</span>
            )}
          </div>

          <div className="pm-field">
            <label className="pm-label">
              Price (₹) <span>*</span>
            </label>
            <input
              className={`pm-input${errors.price ? " error" : ""}`}
              type="number"
              value={form.price}
              onChange={set("price")}
              placeholder="Enter price"
            />
            {errors.price && (
              <span className="pm-error-text">{errors.price}</span>
            )}
          </div>

          <div className="pm-field">
            <label className="pm-label">
              Validity (Days) <span>*</span>
            </label>
            <input
              className={`pm-input${errors.validityDays ? " error" : ""}`}
              type="number"
              value={form.validityDays}
              onChange={set("validityDays")}
              placeholder="Enter days"
            />
            {errors.validityDays && (
              <span className="pm-error-text">{errors.validityDays}</span>
            )}
          </div>

          <div className="pm-field">
            <label className="pm-label">Data Benefits</label>
            <input
              className="pm-input"
              value={form.dataBenefits}
              onChange={set("dataBenefits")}
              placeholder="e.g. 2GB/Day or Unlimited"
            />
          </div>

          <div className="pm-field">
            <label className="pm-label">Call Benefits</label>
            <input
              className="pm-input"
              value={form.callBenefits}
              onChange={set("callBenefits")}
              placeholder="e.g. Unlimited"
            />
          </div>

          <div className="pm-field">
            <label className="pm-label">SMS Benefits</label>
            <input
              className="pm-input"
              value={form.smsBenefits}
              onChange={set("smsBenefits")}
              placeholder="e.g. 100 SMS/Day"
            />
          </div>
        </div>

        <div className="pm-modal-footer">
          <button className="pm-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="pm-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
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

/* ── Main Page ── */
export default function AllPlansPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { plans, operators, categories, isLoading, isError, message } =
    useSelector((state) => state.plans);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editPlanModal, setEditPlanModal] = useState(null);

  /* ── fetch on mount ── */
  useEffect(() => {
    dispatch(loadPlans());
    dispatch(loadOperators());
    dispatch(loadCategories());
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  /* ── error toast ── */
  useEffect(() => {
    if (isError && message) {
      toast(message, "error");
    }
  }, [isError, message, toast]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return plans.filter(
      (p) =>
        p.planName.toLowerCase().includes(q) ||
        (p.operatorName || "").toLowerCase().includes(q) ||
        (p.categoryName || "").toLowerCase().includes(q),
    );
  }, [plans, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleToggleActive = async (plan) => {
    try {
      await dispatch(togglePlan(plan)).unwrap();
      const statusMsg = plan.isActive ? "deactivated" : "activated";
      toast(`Plan ${statusMsg} successfully!`, "success");
    } catch (err) {
      toast(err || "Action failed", "error");
    }
  };

  const handleEditSaved = () => {
    setEditPlanModal(null);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div>
      <div className="pm-page">
        <div className="pm-header">
          <h1 className="pm-title">Plan Management</h1>
          <p className="pm-subtitle">Manage all recharge plans and packages</p>
        </div>

        <div className="pm-card">
          <div className="pm-card-top">
            <div className="pm-card-heading">
              <i className="fa-solid fa-layer-group" />
              <span>All Plans</span>
            </div>
            <button
              className="pm-btn-create"
              onClick={() => navigate("/admin/create-plan")}
            >
              <i className="fa-solid fa-plus" /> Create Plan
            </button>
          </div>
          <hr className="pm-card-divider" />

          <div className="pm-search-wrap">
            <i className="fa-solid fa-magnifying-glass pm-search-icon" />
            <input
              className="pm-search"
              placeholder="Search Plans.."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {isLoading ? (
            <div className="pm-loading">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="pm-table-wrap">
                <table className="pm-table">
                  <thead>
                    <tr>
                      <th>Plan Name</th>
                      <th>Price</th>
                      <th>Validity</th>
                      <th>Data</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="pm-empty">
                          No plans found
                        </td>
                      </tr>
                    ) : (
                      paginated.map((plan) => (
                        <tr key={plan.planId}>
                          <td className="pm-plan-name">{plan.planName}</td>
                          <td className="pm-price">₹{plan.price}</td>
                          <td>
                            {plan.validityDays
                              ? `${plan.validityDays} Days`
                              : "—"}
                          </td>
                          <td>{plan.dataBenefits || "—"}</td>
                          <td>
                            <StatusBadge active={plan.isActive} />
                          </td>
                          <td>
                            <div className="pm-actions">
                              <button
                                className="pm-btn-edit"
                                onClick={() => setEditPlanModal(plan)}
                              >
                                <i className="fa-solid fa-pen" /> Edit
                              </button>
                              <button
                                className="pm-btn-delete"
                                onClick={() => handleToggleActive(plan)}
                                title={
                                  plan.isActive ? "Deactivate" : "Activate"
                                }
                              >
                                <i
                                  className={`fa-solid ${plan.isActive ? "fa-trash" : "fa-rotate-left"}`}
                                />
                                {plan.isActive ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pm-pagination">
                  <button
                    className="pm-pg-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`pm-pg-btn${currentPage === n ? " pm-pg-btn--active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className="pm-pg-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                  <span className="pm-pg-info">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of{" "}
                    {filtered.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {editPlanModal && (
        <EditPlanModal
          plan={editPlanModal}
          operators={operators}
          categories={categories}
          onClose={() => setEditPlanModal(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
}
