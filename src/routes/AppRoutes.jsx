import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import Error from "../pages/Error";
import OffersPage from "../pages/OffersPage";
import RechargePage from "../pages/RechargePage";

import LoginForm from "../features/auth/components/jsx/LoginForm";
import RegisterForm from "../features/auth/components/jsx/RegisterForm";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../components/AdminLayout/AdminLayout";
import UserLayout from "../components/UserLayout/UserLayout";

import AdminProfilePage from "../features/admin/profile/jsx/AdminProfilePage";
import AnalyticsPage from "../features/admin/analytics/jsx/AnalyticsPage";
import AllUsersPage from "../features/admin/users/jsx/AllUsersPage";
import UserRolesPage from "../features/admin/users/jsx/UserRolesPage";
import AllPlansPage from "../features/admin/plans/jsx/AllPlansPage";
import CreatePlanPage from "../features/admin/plans/jsx/CreatePlanPage";
import PlanCategoriesPage from "../features/admin/plans/jsx/PlanCategoriesPage";
import OperatorPlansPage from "../features/admin/operators/jsx/OperatorPlansPage";
import ManageOperatorsPage from "../features/admin/operators/jsx/ManageOperatorsPage";
import AllTransactionsPage from "../features/admin/transactions/jsx/AllTransactionsPage";
import RefundsPage from "../features/admin/transactions/jsx/RefundsPage";
import AllOffersPage from "../features/admin/offers/jsx/AllOffersPage";
import CreateOfferPage from "../features/admin/offers/jsx/CreateOfferPage";
import OfferMappingPage from "../features/admin/offers/jsx/OfferMappingPage";
import AuditLogsPage from "../features/admin/auditLogs/jsx/AuditLogsPage";
import NotificationsPage from "../features/admin/notifications/jsx/NotificationsPage";

import UserOverviewPage from "../features/user/overview/jsx/UserOverviewPage";
import TransactionHistoryPage from "../features/user/transactions/jsx/TransactionHistoryPage";
import UserNotificationsPage from "../features/user/notifications/jsx/NotificationsPage";
import ActivePlansPage from "../features/user/activePlans/jsx/ActivePlansPage";
import ChangePasswordPage from "../features/user/changePassword/jsx/ChangePasswordPage";
import UserProfilePage from "../features/user/profile/jsx/UserProfilePage";
import InvoicesPage from "../features/user/invoice/components/jsx/InvoicesPage";

function AdminRoute({ children }) {
  const { user, accessToken } = useSelector((state) => state.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/profile" replace />;
  return children;
}

function UserRoute({ children }) {
  const { user, accessToken } = useSelector((state) => state.auth);
  if (!accessToken) return <Navigate to="/login" replace />;
  if (user?.role === "ADMIN") return <Navigate to="/admin/analytics" replace />;
  return children;
}

export default function AppRoutes({ sidebarOpen, onSidebarClose, onNotFound }) {  
  const adminProps = { sidebarOpen, onSidebarClose };

  return (
    <Routes>
      {/* Public routes - unchanged */}
      <Route path="/" element={<HomePage />} />
      <Route path="/recharge" element={<RechargePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/offers" element={<OffersPage />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />

      {/* Admin Layout */}
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
        <Route path="all-offers" element={<AllOffersPage />} />
        <Route path="create-offer" element={<CreateOfferPage />} />
        <Route path="offer-mapping" element={<OfferMappingPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* User Layout */}
      <Route
        path="/user"
        element={
          <UserRoute>
            <UserLayout {...adminProps}>
              <Outlet />
            </UserLayout>
          </UserRoute>
        }
      >
        <Route path="overview"        element={<UserOverviewPage />} />
        <Route path="profile"         element={<UserProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="transactions"    element={<TransactionHistoryPage />} />
        <Route path="active-plans"    element={<ActivePlansPage />} />
        <Route path="notifications"   element={<UserNotificationsPage />} />
        <Route path="invoices"        element={<InvoicesPage />} />
      </Route>

      <Route path="*" element={<Error onNotFound={onNotFound} />} />  
    </Routes>
  );
}
