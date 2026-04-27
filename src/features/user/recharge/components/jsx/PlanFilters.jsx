import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveCategory, selectActiveCategory } from '../../slice/rechargeSlice';
import '../css/PlanFilters.css';

/**
 * PlanFilters
 * Props:
 *   plans: API plan array  — uses categoryName from API
 *   searchQuery: string
 *   onSearchChange: fn(value)
 */
export default function PlanFilters({ plans = [], searchQuery, onSearchChange }) {
  const dispatch = useDispatch();
  const activeCategory = useSelector(selectActiveCategory);

  // Derive unique categoryNames from API response
  const presentCategories = [
    'ALL',
    ...new Set(plans.map((p) => p.categoryName).filter(Boolean)),
  ];

  const handleTabClick = (cat) => {
    dispatch(setActiveCategory(cat));
  };

  return (
    <div className="pf-wrapper">
      {/* ── Category tabs ── */}
      <div className="pf-tabs-row">
        {presentCategories.map((cat) => (
          <button
            key={cat}
            className={`pf-tab ${activeCategory === cat ? 'pf-tab--active' : ''}`}
            onClick={() => handleTabClick(cat)}
          >
            {cat === 'ALL' ? 'All Plans' : cat}
          </button>
        ))}
      </div>
    </div>
  );
}