import React from 'react';
import { useSelector } from 'react-redux';
import './Toast.css';

export default function Toast() {
  const { message, type, show } = useSelector((state) => state.toast); 

  if (!show || !message) return null;                                   

  return (
    <div className="toast-wrapper">
      <div className={`toast-box ${type}`}>
        <i className={`fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'} me-2`}></i>
        {message}
      </div>
    </div>
  );
}