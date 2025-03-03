import React from 'react';
import { Link } from 'react-router-dom';
import { Notification, NotificationType } from '../types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
}) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case NotificationType.REQUEST:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case NotificationType.MATCH:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case NotificationType.CAMP:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case NotificationType.SYSTEM:
      default:
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };
  
  // Get link based on notification type and related entity
  const getLink = () => {
    if (!notification.related_entity_id) {
      return null;
    }
    
    switch (notification.type) {
      case NotificationType.REQUEST:
        return `/requests/${notification.related_entity_id}`;
      case NotificationType.MATCH:
        return `/matches/${notification.related_entity_id}`;
      case NotificationType.CAMP:
        return `/camps/${notification.related_entity_id}`;
      default:
        return null;
    }
  };
  
  // Handle click on notification
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };
  
  const link = getLink();
  const content = (
    <div 
      className={`flex items-start p-4 ${!notification.is_read ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors duration-150`}
      onClick={handleClick}
    >
      {getIcon()}
      
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <p className={`text-sm font-medium ${!notification.is_read ? 'text-blue-800' : 'text-gray-900'}`}>
            {notification.title}
          </p>
          <span className="text-xs text-gray-500">
            {formatDate(notification.created_at)}
          </span>
        </div>
        
        <p className={`mt-1 text-sm ${!notification.is_read ? 'text-blue-700' : 'text-gray-600'}`}>
          {notification.message}
        </p>
        
        <div className="mt-2 flex justify-end space-x-2">
          {!notification.is_read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Mark as read
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
            className="text-xs text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
  
  return link ? (
    <Link to={link} className="block border-b border-gray-200 last:border-b-0">
      {content}
    </Link>
  ) : (
    <div className="border-b border-gray-200 last:border-b-0">
      {content}
    </div>
  );
};

export default NotificationItem; 