import supabase from '../../../app/supabase';
import { 
  DeliveryStatus, 
  Notification, 
  NotificationBatchCreateData, 
  NotificationChannel, 
  NotificationCreateData, 
  NotificationFilters, 
  NotificationPreferences, 
  NotificationType 
} from '../types';

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data: NotificationCreateData): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: data.recipient_id,
        type: data.type,
        title: data.title,
        message: data.message,
        related_entity_id: data.related_entity_id || null,
        related_entity_type: data.related_entity_type || null,
        is_read: false,
        read_at: null,
        delivery_status: DeliveryStatus.PENDING,
        channel: data.channel
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
    
    // If this is an email or SMS notification, we would trigger the appropriate service here
    // For now, we'll just mark it as sent
    if (data.channel !== NotificationChannel.IN_APP) {
      await this.updateDeliveryStatus(notification.id, DeliveryStatus.SENT);
    }
    
    return notification;
  }
  
  /**
   * Create multiple notifications at once (for batch notifications)
   */
  async createBatchNotifications(data: NotificationBatchCreateData): Promise<void> {
    const notifications = data.recipient_ids.map(recipientId => ({
      recipient_id: recipientId,
      type: data.type,
      title: data.title,
      message: data.message,
      related_entity_id: data.related_entity_id || null,
      related_entity_type: data.related_entity_type || null,
      is_read: false,
      read_at: null,
      delivery_status: DeliveryStatus.PENDING,
      channel: data.channel
    }));
    
    const { error } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (error) {
      throw new Error(`Failed to create batch notifications: ${error.message}`);
    }
    
    // If these are email or SMS notifications, we would trigger the appropriate service here
    // For now, we'll just mark them as sent if they're not in-app
    if (data.channel !== NotificationChannel.IN_APP) {
      // In a real implementation, we would use a more efficient approach
      // like a batch update or a database function
    }
  }
  
  /**
   * Get all notifications for the current user
   */
  async getUserNotifications(filters?: NotificationFilters): Promise<Notification[]> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to view notifications');
    }
    
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', user.user.id)
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters) {
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      if (filters.searchTerm) {
        query = query.or(`title.ilike.%${filters.searchTerm}%,message.ilike.%${filters.searchTerm}%`);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Get a single notification by ID
   */
  async getNotificationById(notificationId: string): Promise<Notification> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to view notifications');
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('recipient_id', user.user.id)
      .single();
    
    if (error) {
      throw new Error(`Failed to get notification: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to update notifications');
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .eq('recipient_id', user.user.id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(): Promise<void> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to update notifications');
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('recipient_id', user.user.id)
      .eq('is_read', false);
    
    if (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }
  
  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to delete notifications');
    }
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('recipient_id', user.user.id);
    
    if (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }
  
  /**
   * Delete all notifications for the current user
   */
  async deleteAllNotifications(): Promise<void> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to delete notifications');
    }
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('recipient_id', user.user.id);
    
    if (error) {
      throw new Error(`Failed to delete all notifications: ${error.message}`);
    }
  }
  
  /**
   * Update the delivery status of a notification
   */
  async updateDeliveryStatus(notificationId: string, status: DeliveryStatus): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ delivery_status: status })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update delivery status: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Get notification statistics for the current user
   */
  async getNotificationStats(): Promise<any> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to view notification statistics');
    }
    
    // Get total count
    const { count: totalCount, error: totalError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.user.id);
    
    if (totalError) {
      throw new Error(`Failed to get notification count: ${totalError.message}`);
    }
    
    // Get unread count
    const { count: unreadCount, error: unreadError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', user.user.id)
      .eq('is_read', false);
    
    if (unreadError) {
      throw new Error(`Failed to get unread notification count: ${unreadError.message}`);
    }
    
    // Get counts by type
    const { data: typeCounts, error: typeError } = await supabase.rpc('get_notification_type_counts', {
      user_id: user.user.id
    });
    
    if (typeError) {
      throw new Error(`Failed to get notification type counts: ${typeError.message}`);
    }
    
    // If the RPC function doesn't exist, we'll calculate manually
    if (!typeCounts) {
      // Get request count
      const { count: requestCount, error: requestError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.user.id)
        .eq('type', NotificationType.REQUEST);
      
      if (requestError) {
        throw new Error(`Failed to get request notification count: ${requestError.message}`);
      }
      
      // Get match count
      const { count: matchCount, error: matchError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.user.id)
        .eq('type', NotificationType.MATCH);
      
      if (matchError) {
        throw new Error(`Failed to get match notification count: ${matchError.message}`);
      }
      
      // Get camp count
      const { count: campCount, error: campError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.user.id)
        .eq('type', NotificationType.CAMP);
      
      if (campError) {
        throw new Error(`Failed to get camp notification count: ${campError.message}`);
      }
      
      // Get system count
      const { count: systemCount, error: systemError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.user.id)
        .eq('type', NotificationType.SYSTEM);
      
      if (systemError) {
        throw new Error(`Failed to get system notification count: ${systemError.message}`);
      }
      
      return {
        totalCount: totalCount || 0,
        unreadCount: unreadCount || 0,
        requestCount: requestCount || 0,
        matchCount: matchCount || 0,
        campCount: campCount || 0,
        systemCount: systemCount || 0
      };
    }
    
    return {
      totalCount: totalCount || 0,
      unreadCount: unreadCount || 0,
      ...typeCounts
    };
  }
  
  /**
   * Get notification preferences for the current user
   */
  async getNotificationPreferences(): Promise<NotificationPreferences> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to view notification preferences');
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.user.id)
      .single();
    
    if (error) {
      throw new Error(`Failed to get notification preferences: ${error.message}`);
    }
    
    // If preferences don't exist, return defaults
    if (!data.notification_preferences) {
      return {
        email: true,
        sms: false,
        push: true,
        urgentBloodRequests: true,
        donationCampUpdates: true,
        matchNotifications: true,
        systemAnnouncements: true
      };
    }
    
    return data.notification_preferences as NotificationPreferences;
  }
  
  /**
   * Update notification preferences for the current user
   */
  async updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const { data: user, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user.user) {
      throw new Error('You must be logged in to update notification preferences');
    }
    
    // Get current preferences
    const { data: currentData, error: prefError } = await supabase
      .from('profiles')
      .select('notification_preferences')
      .eq('id', user.user.id)
      .single();
    
    if (prefError) {
      throw new Error(`Failed to get current notification preferences: ${prefError.message}`);
    }
    
    // Merge with current preferences
    const currentPreferences = currentData.notification_preferences as NotificationPreferences || {
      email: true,
      sms: false,
      push: true,
      urgentBloodRequests: true,
      donationCampUpdates: true,
      matchNotifications: true,
      systemAnnouncements: true
    };
    
    const updatedPreferences = {
      ...currentPreferences,
      ...preferences
    };
    
    // Update preferences
    const { data, error } = await supabase
      .from('profiles')
      .update({ notification_preferences: updatedPreferences })
      .eq('id', user.user.id)
      .select('notification_preferences')
      .single();
    
    if (error) {
      throw new Error(`Failed to update notification preferences: ${error.message}`);
    }
    
    return data.notification_preferences as NotificationPreferences;
  }
  
  /**
   * Create a notification for a blood request
   */
  async createBloodRequestNotification(
    recipientIds: string[],
    requestId: string,
    requestDetails: { bloodType: string; hospitalName: string; city: string }
  ): Promise<void> {
    const title = `Urgent Blood Request: ${requestDetails.bloodType}`;
    const message = `A patient at ${requestDetails.hospitalName} in ${requestDetails.city} urgently needs ${requestDetails.bloodType} blood. Can you help?`;
    
    await this.createBatchNotifications({
      recipient_ids: recipientIds,
      type: NotificationType.REQUEST,
      title,
      message,
      related_entity_id: requestId,
      related_entity_type: 'blood_requests',
      channel: NotificationChannel.IN_APP
    });
  }
  
  /**
   * Create a notification for a donation match
   */
  async createMatchNotification(
    recipientId: string,
    matchId: string,
    matchDetails: { requestId: string; hospitalName: string; bloodType: string }
  ): Promise<void> {
    const title = 'New Donation Match';
    const message = `You've been matched with a blood request for ${matchDetails.bloodType} at ${matchDetails.hospitalName}. Please check your matches for details.`;
    
    await this.createNotification({
      recipient_id: recipientId,
      type: NotificationType.MATCH,
      title,
      message,
      related_entity_id: matchId,
      related_entity_type: 'donation_matches',
      channel: NotificationChannel.IN_APP
    });
  }
  
  /**
   * Create a notification for a donation camp
   */
  async createCampNotification(
    recipientIds: string[],
    campId: string,
    campDetails: { name: string; startDate: string; city: string }
  ): Promise<void> {
    const formattedDate = new Date(campDetails.startDate).toLocaleDateString();
    const title = `New Donation Camp: ${campDetails.name}`;
    const message = `A new blood donation camp is scheduled for ${formattedDate} in ${campDetails.city}. Register now to participate!`;
    
    await this.createBatchNotifications({
      recipient_ids: recipientIds,
      type: NotificationType.CAMP,
      title,
      message,
      related_entity_id: campId,
      related_entity_type: 'donation_camps',
      channel: NotificationChannel.IN_APP
    });
  }
  
  /**
   * Create a system notification
   */
  async createSystemNotification(
    recipientIds: string[],
    title: string,
    message: string
  ): Promise<void> {
    await this.createBatchNotifications({
      recipient_ids: recipientIds,
      type: NotificationType.SYSTEM,
      title,
      message,
      channel: NotificationChannel.IN_APP
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService; 