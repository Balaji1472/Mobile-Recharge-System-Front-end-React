import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  loadUnread, 
  loadRead, 
  markRead, 
  markAllRead 
} from '../slice/userNotificationsSlice'
import { Spinner } from '../../../../components/common';
import { useToast } from '../../../../hooks/useToast';
import '../css/NotificationsPage.css';

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getTypeStyle(type) {
  switch (type) {
    case 'RECHARGE': return { icon: 'fa-bolt',         color: 'nt-type--recharge' };
    case 'REFUND':   return { icon: 'fa-rotate-left',    color: 'nt-type--refund'   };
    case 'OFFER':    return { icon: 'fa-gift',           color: 'nt-type--offer'    };
    case 'SYSTEM':   return { icon: 'fa-circle-info',    color: 'nt-type--system'   };
    default:         return { icon: 'fa-bell',           color: 'nt-type--default'  };
  }
}

function NotificationCard({ notification, onMarkRead, marking }) {
  const { icon, color } = getTypeStyle(notification.type);
  const isRead = notification.readStatus;

  return (
    <div className={`nt-card ${isRead ? 'nt-card--read' : 'nt-card--unread'}`}>
      <div className={`nt-card-icon ${color}`}>
        <i className={`fa-solid ${icon}`} />
      </div>

      <div className="nt-card-body">
        <p className="nt-card-message">{notification.message}</p>
        <div className="nt-card-meta">
          <span className="nt-card-type">{notification.type}</span>
          <span className="nt-card-time">
            <i className="fa-regular fa-clock" />
            {formatDateTime(notification.sentAt)}
          </span>
        </div>
      </div>

      {!isRead && (
        <button
          className="nt-btn-mark"
          onClick={() => onMarkRead(notification.notificationId)}
          disabled={marking === notification.notificationId}
          title="Mark as read"
        >
          {marking === notification.notificationId
            ? <i className="fa-solid fa-spinner fa-spin" />
            : <i className="fa-solid fa-check" />
          }
        </button>
      )}

      {isRead && (
        <span className="nt-read-dot" title="Read">
          <i className="fa-solid fa-circle-check" />
        </span>
      )}
    </div>
  );
}

const TABS = [
  { id: 'unread', label: 'Unread' },
  { id: 'read',   label: 'Read'   },
];

export default function UserNotificationsPage() {
  const dispatch = useDispatch();
  const { toast } = useToast(); // Using 'toast' as per your custom hook

  const [activeTab, setActiveTab] = useState('unread');
  const [marking, setMarking] = useState(null); // Local state for per-item spinner

  const { unread, read, isLoading, isError, message } = useSelector(
    (state) => state.userNotifications
  );

  useEffect(() => {
    dispatch(loadUnread());
    dispatch(loadRead());
  }, [dispatch]);

  // Handle errors from Redux state
  useEffect(() => {
    if (isError && message) {
      toast(message, 'error');
    }
  }, [isError, message, toast]);

  const handleMarkRead = async (id) => {
    setMarking(id);
    const result = await dispatch(markRead(id));
    if (markRead.fulfilled.match(result)) {
      toast('Notification marked as read', 'success');
    }
    setMarking(null);
  };

  const handleMarkAllRead = async () => {
    if (unread.length === 0) return;
    
    const result = await dispatch(markAllRead());
    if (markAllRead.fulfilled.match(result)) {
      toast('All notifications marked as read!', 'success');
      setActiveTab('read');
    }
  };

  const currentList = activeTab === 'unread' ? unread : read;

  return (
    <div className="nt-page">
      <div className="nt-header">
        <div>
          <h1 className="nt-title">Notifications</h1>
          <p className="nt-subtitle">Stay updated with your account activity</p>
        </div>
        {activeTab === 'unread' && unread.length > 0 && (
          <button
            className="nt-btn-mark-all"
            onClick={handleMarkAllRead}
            disabled={isLoading}
          >
            {isLoading
              ? <><i className="fa-solid fa-spinner fa-spin" /> Marking…</>
              : <><i className="fa-solid fa-check-double" /> Mark all as read</>}
          </button>
        )}
      </div>

      <div className="nt-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nt-tab ${activeTab === tab.id ? 'nt-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'unread' && unread.length > 0 && (
              <span className="nt-tab-badge">{unread.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="nt-content">
        {isLoading && currentList.length === 0 ? (
          <div className="nt-center-state">
            <Spinner size="md" />
            <span>Loading notifications...</span>
          </div>
        ) : currentList.length === 0 ? (
          <div className="nt-empty">
            <i className={`fa-solid ${activeTab === 'unread' ? 'fa-bell-slash' : 'fa-inbox'}`} />
            <p>
              {activeTab === 'unread'
                ? "You're all caught up! No unread notifications."
                : "No read notifications yet."}
            </p>
          </div>
        ) : (
          <div className="nt-list">
            {currentList.map((n) => (
              <NotificationCard
                key={n.notificationId}
                notification={n}
                onMarkRead={handleMarkRead}
                marking={marking}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}