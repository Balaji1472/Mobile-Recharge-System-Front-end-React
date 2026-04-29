import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectPlans,
  selectActiveCategory,
  selectSearchQuery,
  setSearchQuery,
  resetRecharge,
} from '../../slice/rechargeSlice';
import PlanCard from './PlanCard';
import PlanFilters from './PlanFilters';
import '../css/PlansListStep.css';

export default function PlansListStep() {
  const dispatch = useDispatch();
  const plans = useSelector(selectPlans);
  const activeCategory = useSelector(selectActiveCategory);
  const searchQuery = useSelector(selectSearchQuery);

  const filteredPlans = useMemo(() => {
    let result = plans;

    if (activeCategory !== 'ALL') {
      result = result.filter((p) => p.categoryName === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.planName?.toLowerCase().includes(q) ||
          p.categoryName?.toLowerCase().includes(q) ||
          p.operatorName?.toLowerCase().includes(q) ||
          String(Math.floor(p.price)).includes(q) ||
          p.dataBenefits?.toLowerCase().includes(q) ||
          p.callBenefits?.toLowerCase().includes(q) ||
          String(p.validityDays).includes(q)
      );
    }

    return result;
  }, [plans, activeCategory, searchQuery]);

  const handleChange = () => {
    dispatch(resetRecharge());
  };

  return (
    <div className="pls-wrapper">
      {/* ── Breadcrumb ── */}
      <nav className="pls-breadcrumb">
        <button className="pls-breadcrumb-back" onClick={handleChange}>
          <i className="bi bi-chevron-left" /> Recharge
        </button>
        <span className="pls-breadcrumb-sep">›</span>
        <span className="pls-breadcrumb-current">All Packs</span>
      </nav>

      {/* ── Heading ── */}
      <div className="pls-header">
        <h1 className="pls-title">Recharge Packs</h1>
      </div>

      {/* ── Search bar (inline, above tabs) ── */}
      <div className="pls-search-wrap">
        <div className="pls-search-box">
          <i className="bi bi-search pls-search-icon" />
          <input
            className="pls-search-input"
            type="text"
            placeholder="Search for a pack"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          />
          {searchQuery && (
            <button className="pls-search-clear" onClick={() => dispatch(setSearchQuery(''))}>
              <i className="bi bi-x" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category Filters ── */}
      <div className="pls-filters-wrap">
        <PlanFilters plans={plans} />
      </div>

      {/* ── Plans list ── */}
      {filteredPlans.length === 0 ? (
        <div className="pls-empty">
          <i className="bi bi-inbox pls-empty-icon" />
          <p>No plans found{searchQuery ? ` for "${searchQuery}"` : ''}.</p>
          {searchQuery && (
            <button className="pls-clear-search" onClick={() => dispatch(setSearchQuery(''))}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="pls-list">
          {filteredPlans.map((plan, index) => (
            <div key={plan.planId} className="pls-list-item">
              {index === 0 && (
                <div className="pls-trending-tag">
                  <i className="bi bi-fire" /> Trending
                </div>
              )}
              <PlanCard plan={plan} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}