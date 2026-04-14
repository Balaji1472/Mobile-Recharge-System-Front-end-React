import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

import HomePage        from '../pages/HomePage';
import AboutPage       from '../pages/AboutPage';
import ContactPage     from '../pages/ContactPage';
import ProfilePage     from '../pages/ProfilePage';
import LoginForm       from '../components/Auth/LoginForm';
import RegisterForm    from '../components/Auth/RegisterForm';
import ProtectedRoute  from '../components/ProtectedRoute';
import Error           from '../pages/Error';
import OffersPage      from '../pages/OffersPage';
import AdminProfilePage from '../pages/Admin/AdminProfilePage';
import RechargePage from '../pages/RechargePage';

function AdminRoute({ children }) {
  const { user, accessToken } = useSelector((state) => state.auth);
  if (!accessToken)           return <Navigate to="/login"   replace />;
  if (user?.role !== 'ADMIN') return <Navigate to="/profile" replace />;
  return children;
}

export default function AppRoutes({ sidebarOpen, onSidebarClose }) {
  return (
    <Routes>
      <Route path="/"         element={<HomePage />} />
      <Route path='/recharge' element={<RechargePage/>}></Route>
      <Route path="/about"    element={<AboutPage />} />
      <Route path="/contact"  element={<ContactPage />} />
      <Route path="/offers"   element={<OffersPage />} />
      <Route path="/login"    element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/profile"  element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* Admin routes — pass sidebar props */}
      <Route path="/admin/profile" element={
        <AdminRoute>
          <AdminProfilePage sidebarOpen={sidebarOpen} onSidebarClose={onSidebarClose} />
        </AdminRoute>
      } />

      <Route path="*" element={<Error />} />
    </Routes>
  );
}