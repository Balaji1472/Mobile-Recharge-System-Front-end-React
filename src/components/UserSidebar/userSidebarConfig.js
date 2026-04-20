export const USER_PAGES = [
  // ACCOUNT Group
  { id: 'overview',            label: 'Overview',            icon: 'fa-house',              href: '/user/overview',        group: 'Account' },
  { id: 'view-profile',        label: 'View Profile',        icon: 'fa-user',               href: '/user/profile',         group: 'Account' },
  // SECURITY Group
  { id: 'change-password',     label: 'Change Password',     icon: 'fa-lock',               href: '/user/change-password', group: 'Security' },
  // RECHARGE HISTORY Group
  { id: 'transaction-history', label: 'Transaction History', icon: 'fa-receipt',            href: '/user/transactions',    group: 'Recharge History' },
  { id: 'active-plans',        label: 'Active Plans',        icon: 'fa-chart-simple',       href: '/user/active-plans',    group: 'Recharge History' },
  // ACTIVITY Group
  { id: 'notifications',       label: 'Notifications',       icon: 'fa-bell',               href: '/user/notifications',   group: 'Activity' },
  { id: 'invoices',            label: 'Invoices',            icon: 'fa-file-invoice',       href: '/user/invoices',        group: 'Activity' },
];