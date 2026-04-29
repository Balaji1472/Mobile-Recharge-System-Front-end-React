import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadAnalytics, resetAnalytics } from '../slice/analyticsSlice';
import { useToast } from '../../../../hooks/useToast';
import AISummaryCard from '../../../summary/jsx/AISummaryCard';
import '../css/AnalyticsPage.css';

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  const num = parseFloat(amount);
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
};

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const { data, isLoading, isError, message } = useSelector((state) => state.analytics);
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      dispatch(loadAnalytics());
    }
    return () => {
      dispatch(resetAnalytics());
    };
  }, [dispatch, accessToken]);

  useEffect(() => {
    if (isError && message) {
      toast(message, 'error');
    }
  }, [isError, message, toast]);

  return (
    <div>
      <div className="an-page">
        <div className="an-header">
          <h1 className="an-title">Analytics</h1>
          <p className="an-subtitle">Detailed insights and performance metrics</p>
        </div>

        {isLoading && (
          <div className="an-loader">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>Loading analytics...</span>
          </div>
        )}

        {!isLoading && !isError && data && (
          <>
            {/* KPI Cards */}
            <div className="an-kpi-grid">
              <KpiCard icon="fa-receipt" label="Total Recharges" value={formatNumber(data.totalRecharges)} accent="blue" />
              <KpiCard icon="fa-indian-rupee-sign" label="Total Revenue" value={formatCurrency(data.totalRevenue)} accent="green" />
              <KpiCard icon="fa-layer-group" label="Active Plans" value={formatNumber(data.activePlans)} accent="orange" />
              <KpiCard icon="fa-users" label="Total Users" value={formatNumber(data.totalUsers)} accent="purple" />
            </div>

            {/* Breakdown Section */}
            <div className="an-section-grid">
              <div className="an-card">
                <div className="an-card-header">
                  <span className="an-card-icon red"><i className="fa-solid fa-chart-pie"></i></span>
                  <h2 className="an-card-title">Recharge Breakdown</h2>
                </div>
                <div className="an-stat-list">
                  <StatRow 
                    icon="fa-circle-check" label="Successful" value={formatNumber(data.successfulRecharges)} 
                    valueClass="green" bar={data.totalRecharges ? (data.successfulRecharges / data.totalRecharges) * 100 : 0} barClass="green" 
                  />
                  <StatRow 
                    icon="fa-circle-xmark" label="Failed" value={formatNumber(data.failedRecharges)} 
                    valueClass="red" bar={data.totalRecharges ? (data.failedRecharges / data.totalRecharges) * 100 : 0} barClass="red" 
                  />
                  <StatRow 
                    icon="fa-rotate-left" label="Refunded" value={formatNumber(data.refundedRecharges)} 
                    valueClass="orange" bar={data.totalRecharges ? (data.refundedRecharges / data.totalRecharges) * 100 : 0} barClass="orange" 
                  />
                </div>
              </div>

              {/* Refund Statistics */}
              <div className="an-card">
                <div className="an-card-header">
                  <span className="an-card-icon orange"><i className="fa-solid fa-rotate-left"></i></span>
                  <h2 className="an-card-title">Refund Statistics</h2>
                </div>
                <div className="an-refund-grid">
                  <RefundStat icon="fa-check-double" label="Processed" value={formatNumber(data.totalRefundsProcessed)} accent="green" />
                  <RefundStat icon="fa-coins" label="Total Amount" value={formatCurrency(data.totalRefundAmount)} accent="orange" />
                </div>
              </div>
            </div>
          </>
        )}
        {!isLoading && !isError && data && (
          <AISummaryCard role="admin" ready={true} />
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */
function KpiCard({ icon, label, value, accent }) {
  return (
    <div className={`an-kpi-card an-kpi-${accent}`}>
      <div className="an-kpi-icon-wrap"><i className={`fa-solid ${icon}`}></i></div>
      <div className="an-kpi-body">
        <span className="an-kpi-value">{value}</span>
        <span className="an-kpi-label">{label}</span>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value, valueClass, bar, barClass }) {
  return (
    <div className="an-stat-row">
      <div className="an-stat-top">
        <span className="an-stat-label"><i className={`fa-solid ${icon} an-icon-${valueClass}`}></i> {label}</span>
        <span className={`an-stat-value an-text-${valueClass}`}>{value}</span>
      </div>
      <div className="an-bar-track">
        <div className={`an-bar-fill an-bar-${barClass}`} style={{ width: `${bar}%` }}></div>
      </div>
    </div>
  );
}

function RefundStat({ icon, label, value, accent }) {
  return (
    <div className={`an-refund-stat an-refund-${accent}`}>
      <i className={`fa-solid ${icon}`}></i>
      <span className="an-refund-value">{value}</span>
      <span className="an-refund-label">{label}</span>
    </div>
  );
}