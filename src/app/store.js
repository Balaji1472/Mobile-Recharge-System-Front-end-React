import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/slice/authSlice";
import toastReducer from "../features/toast/slice/toastSlice";
import analyticsReducer from "../features/admin/analytics/slice/analyticsSlice";
import auditLogsReducer from "../features/admin/auditLogs/slice/auditLogsSlice";
import notificationsReducer from "../features/admin/notifications/slice/notificationsSlice";
import offersReducer from "../features/admin/offers/slice/offersSlice";
import plansReducer from "../features/admin/plans/slice/plansSlice";
import operatorsReducer from "../features/admin/operators/slice/operatorsSlice";
import transactionsReducer from "../features/admin/transactions/slice/transactionsSlice"
import adminUsersReducer from "../features/admin/users/slice/usersSlice";
import adminProfileReducer from '../features/admin/profile/slice/adminProfileSlice';
import activePlansReducer from "../features/user/activePlans/slice/activePlansSlice";
import changePasswordReducder from "../features/user/changePassword/slice/changePasswordSlice";
import userNotificationsReducder from "../features/user/notifications/slice/userNotificationsSlice";
import userOverviewReducer from "../features/user/overview/slice/userOverviewSlice";
import userProfileReducer from "../features/user/profile/slice/userProfileSlice";
import userTransactionsReducer from "../features/user/transactions/slice/userTransactionsSlice";
import rechargeReducer from "../features/user/recharge/slice/rechargeSlice";
import invoiceReducer from "../features/user/invoice/slice/invoiceSlice";
import aiSummaryReducer from "../features/summary/slice/aiSummarySlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    analytics: analyticsReducer,
    auditLogs: auditLogsReducer,
    adminNotifications: notificationsReducer,
    offers: offersReducer,
    plans: plansReducer,
    operators: operatorsReducer,
    transactions: transactionsReducer,
    users: adminUsersReducer,
    adminProfile: adminProfileReducer,
    activePlans: activePlansReducer,
    changePassword: changePasswordReducder,
    userNotifications: userNotificationsReducder,
    userOverview: userOverviewReducer,
    userProfile: userProfileReducer,
    userTransactions: userTransactionsReducer,
    recharge: rechargeReducer,
    invoice: invoiceReducer,
    aiSummary: aiSummaryReducer,
  },
});