import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadAISummary, resetAISummary } from "../slice/aiSummarySlice";
import "../css/AISummaryCard.css";

export default function AISummaryCard({ role, ready }) {
  const dispatch = useDispatch();

  const { summary, isLoading, isError, message } = useSelector(
    (state) => state.aiSummary
  );
  const { accessToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (ready && accessToken) {
      dispatch(loadAISummary({ role, token: accessToken }));
    }
    return () => dispatch(resetAISummary());
  }, [dispatch, role, ready, accessToken]);

  return (
    <div className="ais-card">
      <div className="ais-header">
        <span className="ais-badge">
          <i className="fa-solid fa-wand-magic-sparkles" />
          AI Summary
        </span>
        <span className="ais-powered">Powered by Groq</span>
      </div>

      <hr className="ais-divider" />

      {isLoading && (
        <div className="ais-skeleton-wrap">
          <div className="ais-skeleton" />
          <div className="ais-skeleton" />
          <div className="ais-skeleton ais-skeleton--short" />
        </div>
      )}

      {!isLoading && isError && (
        <p className="ais-error">
          <i className="fa-solid fa-triangle-exclamation" />
          {message || "Failed to generate summary."}
        </p>
      )}

      {!isLoading && !isError && summary && (
        <p className="ais-text">{summary}</p>
      )}
    </div>
  );
}