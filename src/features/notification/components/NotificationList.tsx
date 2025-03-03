import React from 'react';
import { Notification, NotificationType } from '../types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  loading: boolean;
  error: string | null;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onDeleteAll,
  loading,
  error,
}) => {
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.is_read).length;
  
  // Group notifications by type
  const requestNotifications = notifications.filter(n => n.type === NotificationType.REQUEST);
  const matchNotifications = notifications.filter(n => n.type === NotificationType.MATCH);
  const campNotifications = notifications.filter(n => n.type === NotificationType.CAMP);
  const systemNotifications = notifications.filter(n => n.type === NotificationType.SYSTEM);
  
  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-700 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading notifications...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }
  
  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <p className="mt-2 text-gray-600">No notifications yet</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-600">
              You have {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={onDeleteAll}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {/* Render notifications by type if they exist */}
        {requestNotifications.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-gray-100">
              <h4 className="text-sm font-medium text-gray-700">Blood Requests</h4>
            </div>
            {requestNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        
        {matchNotifications.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-gray-100">
              <h4 className="text-sm font-medium text-gray-700">Donation Matches</h4>
            </div>
            {matchNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        
        {campNotifications.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-gray-100">
              <h4 className="text-sm font-medium text-gray-700">Donation Camps</h4>
            </div>
            {campNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        
        {systemNotifications.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-gray-100">
              <h4 className="text-sm font-medium text-gray-700">System Notifications</h4>
            </div>
            {systemNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationList; 