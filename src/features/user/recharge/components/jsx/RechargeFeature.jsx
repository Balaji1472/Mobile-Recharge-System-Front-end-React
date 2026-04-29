import React from 'react';
import { useSelector } from 'react-redux';
import { selectStep } from '../../slice/rechargeSlice';
import PlansListStep from './PlansListStep';
import '../css/RechargeFeature.css';


export default function RechargeFeature() {
  const step = useSelector(selectStep);

  return (
    <div className="rf-root">
      {step === 'plans' && <PlansListStep />}
    </div>
  );
}