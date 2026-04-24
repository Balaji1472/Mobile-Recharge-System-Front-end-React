import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loadCategories,
  addCategory,
  editCategory,
  toggleCategory,
  reset,
} from "../slice/plansSlice";
import { Spinner } from "../../../../components/common";
import { useToast } from "../../../../hooks/useToast";
import "../css/PlanCategoriesPage.css";

const ITEMS_PER_PAGE = 8;

/* ── Status Badge ── */
function StatusBadge({ active }) {
  return (
    <span
      className={`pc-badge ${active ? "pc-badge--active" : "pc-badge--inactive"}`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

/* ── Category Modal ── */
function CategoryModal({ category, onClose, onSaved }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const isEdit = !!category;

  const [form, setForm] = useState({
    categoryCode: category?.categoryCode ?? "",
    displayName: category?.displayName ?? "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!isEdit && !form.categoryCode.trim())
      err.categoryCode = "Category code is required";
    if (!form.displayName.trim()) err.displayName = "Display name is required";
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
      let saved;
      if (isEdit) {
        saved = await dispatch(
          editCategory({
            catId: category.categoryId,
            payload: {
              categoryCode: category.categoryCode,
              displayName: form.displayName.trim(),
            },
          }),
        ).unwrap();
        toast("Category updated successfully!", "success");
      } else {
        saved = await dispatch(
          addCategory({
            categoryCode: form.categoryCode.trim().toUpperCase(),
            displayName: form.displayName.trim(),
          }),
        ).unwrap();
        toast("New category added!", "success");
      }
      onSaved(saved, isEdit);
    } catch (err) {
      toast(err || "Failed to save category", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pc-modal-header">
          <div>
            <p className="pc-modal-title">
              {isEdit ? "Edit Category" : "Add Category"}
            </p>
            <p className="pc-modal-hint">
              {isEdit
                ? "Update category display name"
                : "Create a new plan category"}
            </p>
          </div>
          <button className="pc-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="pc-modal-fields">
          {!isEdit && (
            <div className="pc-field">
              <label className="pc-label">
                Category Code <span>*</span>
              </label>
              <input
                className={`pc-input${errors.categoryCode ? " error" : ""}`}
                placeholder="e.g. COMBO, DATA_ONLY"
                value={form.categoryCode}
                onChange={set("categoryCode")}
              />
              {errors.categoryCode && (
                <span className="pc-error-text">{errors.categoryCode}</span>
              )}
            </div>
          )}

          <div className="pc-field">
            <label className="pc-label">
              Display Name <span>*</span>
            </label>
            <input
              className={`pc-input${errors.displayName ? " error" : ""}`}
              placeholder="e.g. Combo Plans"
              value={form.displayName}
              onChange={set("displayName")}
            />
            {errors.displayName && (
              <span className="pc-error-text">{errors.displayName}</span>
            )}
          </div>
        </div>

        <div className="pc-modal-footer">
          <button className="pc-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className="pc-btn-save"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <i className="fa-solid fa-spinner fa-spin" /> Saving…
              </>
            ) : (
              <>
                <i className="fa-solid fa-check" />{" "}
                {isEdit ? "Save Changes" : "Add Category"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function PlanCategoriesPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { categories, isLoading, isError, message } = useSelector(
    (state) => state.plans,
  );

  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);

  /* ── fetch on mount ── */
  useEffect(() => {
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

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = categories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleToggle = async (cat) => {
    try {
      await dispatch(toggleCategory(cat)).unwrap();
      toast(
        `Category ${cat.isActive ? "deactivated" : "activated"} successfully!`,
        "success",
      );
    } catch (err) {
      toast(err || "Something went wrong", "error");
    }
  };

  const handleSaved = (savedCategory, isEdit) => {
    setModal(null);
  };

  return (
    <div>
      <div className="pc-page">
        <div className="pc-header">
          <h1 className="pc-title">Plan Categories</h1>
          <p className="pc-subtitle">Manage recharge plan categories</p>
        </div>

        <div className="pc-card">
          <div className="pc-card-top">
            <div className="pc-card-heading">
              <i className="fa-solid fa-tags" />
              <span>Categories</span>
            </div>
            <button className="pc-btn-add" onClick={() => setModal("add")}>
              <i className="fa-solid fa-plus" /> Add Category
            </button>
          </div>
          <hr className="pc-card-divider" />

          {isLoading ? (
            <div className="pc-loading">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="pc-table-wrap">
                <table className="pc-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Category Name</th>
                      <th>Total Plans</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="pc-empty">
                          No categories found
                        </td>
                      </tr>
                    ) : (
                      paginated.map((cat, idx) => (
                        <tr key={cat.categoryId}>
                          <td className="pc-cat-num">
                            {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                          </td>
                          <td className="pc-cat-name">{cat.displayName}</td>
                          <td>{cat.totalPlans ?? "—"}</td>
                          <td>
                            <StatusBadge active={cat.isActive} />
                          </td>
                          <td>
                            <div className="pc-actions">
                              <button
                                className="pc-btn-edit"
                                onClick={() => setModal(cat)}
                              >
                                <i className="fa-solid fa-pen" /> Edit
                              </button>
                              <button
                                className="pc-btn-toggle"
                                onClick={() => handleToggle(cat)}
                                title={cat.isActive ? "Deactivate" : "Activate"}
                              >
                                <i
                                  className={`fa-solid ${cat.isActive ? "fa-trash" : "fa-rotate-left"}`}
                                />
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
                <div className="pc-pagination">
                  <button
                    className="pc-pg-btn"
                    onClick={() => setPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`pc-pg-btn${currentPage === n ? " pc-pg-btn--active" : ""}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    className="pc-pg-btn"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                  <span className="pc-pg-info">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, categories.length)}{" "}
                    of {categories.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal && (
        <CategoryModal
          category={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
