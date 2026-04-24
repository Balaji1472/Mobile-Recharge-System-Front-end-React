import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useSelector((state) => state.auth); 

  if (isLoading) {
    return (
      <div className="page-loader">
        <div className="page-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}