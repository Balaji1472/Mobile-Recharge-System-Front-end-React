import React from 'react';
import { useSelector } from 'react-redux';
import { selectStep } from '../../slice/rechargeSlice';
import PlansListStep from './PlansListStep';
import '../css/RechargeFeature.css';

/**
 * RechargeFeature
 *
 * Renders the correct step based on Redux state.
 * PlanDetailModal is rendered at the RechargePage level to ensure
 * it overlays the entire page (including sidebar).
 *
 * step === 'plans'  → PlansListStep
 */
export default function RechargeFeature() {
  const step = useSelector(selectStep);

  return (
    <div className="rf-root">
      {step === 'plans' && <PlansListStep />}
    </div>
  );
}