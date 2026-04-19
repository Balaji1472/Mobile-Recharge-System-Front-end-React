import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { Spinner } from '../../components/common';
import { useToast } from '../../hooks/useToast';
import api from '../../api/axios';
import './PlanCategoriesPage.css';

const ITEMS_PER_PAGE = 8;

/* ── Status Badge ── */
function StatusBadge({ active }) {
  return (
    <span className={`pc-badge ${active ? 'pc-badge--active' : 'pc-badge--inactive'}`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function CategoryModal({ category, onClose, onSaved }) {
  const isEdit = !!category;
  const [form, setForm] = useState({
    categoryCode: category?.categoryCode ?? '',
    displayName: category?.displayName ?? '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((er) => ({ ...er, [field]: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!isEdit && !form.categoryCode.trim()) err.categoryCode = 'Category code is required';
    if (!form.displayName.trim()) err.displayName = 'Display name is required';
    return err;
  };

  const handleSave = async () => {
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    setSaving(true);
    try {
      let data;
      if (isEdit) {
        const res = await api.put(`/categories/${category.categoryId}`, {
          categoryCode: category.categoryCode,
          displayName: form.displayName.trim(),
        });
        data = res.data;
      } else {
        const res = await api.post('/categories', {
          categoryCode: form.categoryCode.trim().toUpperCase(),
          displayName: form.displayName.trim(),
        });
        data = res.data;
      }
      onSaved(data, isEdit);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pc-overlay" onClick={onClose}>
      <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pc-modal-header">
          <div>
            <p className="pc-modal-title">{isEdit ? 'Edit Category' : 'Add Category'}</p>
            <p className="pc-modal-hint">{isEdit ? 'Update category display name' : 'Create a new plan category'}</p>
          </div>
          <button className="pc-modal-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="pc-modal-fields">
          {/* Category Code — only for new */}
          {!isEdit && (
            <div className="pc-field">
              <label className="pc-label">Category Code <span>*</span></label>
              <input
                className={`pc-input${errors.categoryCode ? ' error' : ''}`}
                placeholder="e.g. COMBO, DATA_ONLY"
                value={form.categoryCode}
                onChange={set('categoryCode')}
              />
              {errors.categoryCode && <span className="pc-error-text">{errors.categoryCode}</span>}
            </div>
          )}

          {/* Display Name */}
          <div className="pc-field">
            <label className="pc-label">Display Name <span>*</span></label>
            <input
              className={`pc-input${errors.displayName ? ' error' : ''}`}
              placeholder="e.g. Combo Plans"
              value={form.displayName}
              onChange={set('displayName')}
            />
            {errors.displayName && <span className="pc-error-text">{errors.displayName}</span>}
          </div>
        </div>

        <div className="pc-modal-footer">
          <button className="pc-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="pc-btn-save" onClick={handleSave} disabled={saving}>
            {saving
              ? <><i className="fa-solid fa-spinner fa-spin" /> Saving…</>
              : <><i className="fa-solid fa-check" /> {isEdit ? 'Save Changes' : 'Add Category'}</>}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function PlanCategoriesPage({ sidebarOpen, onSidebarClose }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); 
  const {showToast} = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const totalPages = Math.max(1, Math.ceil(categories.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = categories.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handleToggle = async (cat) => {
    try {
      const endpoint = cat.isActive ? 'deactivate' : 'activate';
      await api.put(`/categories/${cat.categoryId}/${endpoint}`);

      //success feedback
      showToast(`Category ${cat.isActive ? 'deactivated' : 'activated'} successfully!`, 'success');

      setCategories((prev) =>
        prev.map((c) => (c.categoryId === cat.categoryId ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (err) {
        const backendMessage = err.response?.data?.message || "Something went wrong";
        showToast(backendMessage, 'error');
        console.error("Toggle Error:", backendMessage);
    }
  };

  const handleSaved = (savedCategory, isEdit) => {
    if (isEdit) {
      setCategories((prev) =>
        prev.map((c) => (c.categoryId === savedCategory.categoryId ? savedCategory : c))
      );
      showToast("Category updated successfully!", "success");
    } else {
      setCategories((prev) => [...prev, savedCategory]);
      showToast("New category added!", "success");
    }
    setModal(null);
  };

  return (
    <div >
      <div className="pc-page">
        {/* Header */}
        <div className="pc-header">
          <h1 className="pc-title">Plan Categories</h1>
          <p className="pc-subtitle">Manage recharge plan categories</p>
        </div>

        {/* Card */}
        <div className="pc-card">
          <div className="pc-card-top">
            <div className="pc-card-heading">
              <i className="fa-solid fa-tags" />
              <span>Categories</span>
            </div>
            <button className="pc-btn-add" onClick={() => setModal('add')}>
              <i className="fa-solid fa-plus" /> Add Category
            </button>
          </div>
          <hr className="pc-card-divider" />

          {loading ? (
            <div className="pc-loading"><Spinner /></div>
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
                        <td colSpan={5} className="pc-empty">No categories found</td>
                      </tr>
                    ) : (
                      paginated.map((cat, idx) => (
                        <tr key={cat.categoryId}>
                          <td className="pc-cat-num">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                          <td className="pc-cat-name">{cat.displayName}</td>
                          {/* Boilerplate: totalPlans will come from backend response later */}
                          <td>{cat.totalPlans ?? '—'}</td>
                          <td><StatusBadge active={cat.isActive} /></td>
                          <td>
                            <div className="pc-actions">
                              <button className="pc-btn-edit" onClick={() => setModal(cat)}>
                                <i className="fa-solid fa-pen" /> Edit
                              </button>
                              <button
                                className="pc-btn-toggle"
                                onClick={() => handleToggle(cat)}
                                title={cat.isActive ? 'Deactivate' : 'Activate'}
                              >
                                <i className={`fa-solid ${cat.isActive ? 'fa-trash' : 'fa-rotate-left'}`} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pc-pagination">
                  <button className="pc-pg-btn" onClick={() => setPage((p) => p - 1)} disabled={currentPage === 1}>
                    <i className="fa-solid fa-chevron-left" />
                  </button>
                  {pageNumbers.map((n) => (
                    <button
                      key={n}
                      className={`pc-pg-btn${currentPage === n ? ' pc-pg-btn--active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  ))}
                  <button className="pc-pg-btn" onClick={() => setPage((p) => p + 1)} disabled={currentPage === totalPages}>
                    <i className="fa-solid fa-chevron-right" />
                  </button>
                  <span className="pc-pg-info">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, categories.length)} of {categories.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <CategoryModal
          category={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}