import { useState, useEffect, useCallback } from 'react';
import { 
  Notification, 
  NotificationFilters, 
  NotificationPreferences, 
  NotificationStats, 
  NotificationType 
} from '../types';
import notificationService from '../services/notificationService';

export const useNotification = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch all notifications for the current user
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedNotifications = await notificationService.getUserNotifications(filters);
      setNotifications(fetchedNotifications);
      
      // Update unread count
      const unreadNotifications = fetchedNotifications.filter(n => !n.is_read);
      setUnreadCount(unreadNotifications.length);
      
      return fetchedNotifications;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notifications'));
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch notification statistics
  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedStats = await notificationService.getNotificationStats();
      setStats(fetchedStats);
      setUnreadCount(fetchedStats.unreadCount);
      return fetchedStats;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notification statistics'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch notification preferences
  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedPreferences = await notificationService.getNotificationPreferences();
      setPreferences(fetchedPreferences);
      return fetchedPreferences;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch notification preferences'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedNotification = await notificationService.markAsRead(notificationId);
      
      // Update notifications list
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? updatedNotification : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return updatedNotification;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notification as read'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.markAllAsRead();
      
      // Update notifications list
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      
      // Update unread count
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark all notifications as read'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.deleteNotification(notificationId);
      
      // Update notifications list
      const updatedNotifications = notifications.filter(n => n.id !== notificationId);
      setNotifications(updatedNotifications);
      
      // Update unread count if needed
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete notification'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [notifications]);

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await notificationService.deleteAllNotifications();
      
      // Clear notifications list
      setNotifications([]);
      
      // Reset unread count
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete all notifications'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback(async (updatedPreferences: Partial<NotificationPreferences>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newPreferences = await notificationService.updateNotificationPreferences(updatedPreferences);
      setPreferences(newPreferences);
      return newPreferences;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update notification preferences'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter notifications by type
  const filterByType = useCallback((type: NotificationType) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Filter notifications by read status
  const filterByReadStatus = useCallback((isRead: boolean) => {
    return notifications.filter(n => n.is_read === isRead);
  }, [notifications]);

  // Load initial data
  useEffect(() => {
    fetchNotifications();
    fetchStats();
    fetchPreferences();
  }, [fetchNotifications, fetchStats, fetchPreferences]);

  return {
    // State
    notifications,
    unreadCount,
    stats,
    preferences,
    isLoading,
    error,
    
    // Fetch operations
    fetchNotifications,
    fetchStats,
    fetchPreferences,
    
    // Notification operations
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    
    // Preference operations
    updatePreferences,
    
    // Helper functions
    filterByType,
    filterByReadStatus
  };
};

export default useNotification; 