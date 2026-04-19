import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import ProfilePage from "../pages/ProfilePage";
import LoginForm from "../components/Auth/LoginForm";
import RegisterForm from "../components/Auth/RegisterForm";
import ProtectedRoute from "../components/ProtectedRoute";
import Error from "../pages/Error";
import OffersPage from "../pages/OffersPage";
import RechargePage from "../pages/RechargePage";

import AdminProfilePage from "../pages/Admin/AdminProfilePage";
import AnalyticsPage from "../pages/Admin/Analyticspage";
import AllUsersPage from "../pages/Admin/AllUsersPage";
import UserRolesPage from "../pages/Admin/UserRolesPage";
import AllPlansPage from "../pages/Admin/AllPlansPage";
import CreatePlanPage from "../pages/Admin/CreatePlanPage";
import PlanCategoriesPage from "../pages/Admin/PlanCategoriesPage";
import AdminLayout from "../components/AdminLayout/AdminLayout";
import OperatorPlansPage from "../pages/Admin/OperatorPlansPage";
import ManageOperatorsPage from "../pages/Admin/ManageOperatorsPage";
import AllTransactionsPage from "../pages/Admin/AllTransactionsPage";
import RefundsPage from "../pages/Admin/RefundsPage";
import NotificationsPage from "../pages/Admin/NotificationsPage";
import AuditLogsPage from "../pages/Admin/AuditLogsPage";
import AllOffersPage from "../pages/Admin/AllOffersPage";
import OfferMappingPage from "../pages/Admin/OfferMappingPage";
import CreateOfferPage from "../pages/Admin/CreateOfferPage";

function AdminRoute({ children }) {
  const { user, accessToken } = useSelector((state) => state.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/profile" replace />;
  return children;
}

export default function AppRoutes({ sidebarOpen, onSidebarClose }) {
  const adminProps = { sidebarOpen, onSidebarClose };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/recharge" element={<RechargePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/offers" element={<OffersPage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Persistent Admin Layout Wrapper */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout {...adminProps}>
              <Outlet />
            </AdminLayout>
          </AdminRoute>
        }
      >
        {/* Child routes */}
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="all-users" element={<AllUsersPage />} />
        <Route path="user-roles" element={<UserRolesPage />} />
        <Route path="all-plans" element={<AllPlansPage />} />
        <Route path="create-plan" element={<CreatePlanPage />} />
        <Route path="plan-categories" element={<PlanCategoriesPage />} />
        <Route path="operator-plans" element={<OperatorPlansPage />} />
        <Route path="manage-operators" element={<ManageOperatorsPage />} />
        <Route path="all-transactions" element={<AllTransactionsPage />} />
        <Route path="refunds" element={<RefundsPage />} />
        <Route path="all-offers"       element={<AllOffersPage />} />
        <Route path="create-offer"     element={<CreateOfferPage />} />
        <Route path="offer-mapping"    element={<OfferMappingPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Error />} />
    </Routes>
  );
}
