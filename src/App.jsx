import React, { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import './index.css';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Toast from './components/Toast/Toast';
import AppRoutes from './routes/AppRoutes';

function AppShell() {
  const location = useLocation();
  const isAdmin  = location.pathname.startsWith('/admin');
  const isRecharge = location.pathname.startsWith('/recharge');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar
        onSidebarToggle={() => setSidebarOpen((o) => !o)}
        sidebarOpen={sidebarOpen}
      />
      <AppRoutes sidebarOpen={sidebarOpen} onSidebarClose={() => setSidebarOpen(false)} />
      {(!isAdmin || !isRecharge) && <Footer />}
      <Toast />
      {/* Overlay — closes sidebar when tapping outside on mobile */}
      {isAdmin && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </Provider>
  );
}