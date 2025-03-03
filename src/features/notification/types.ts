export enum NotificationType {
  REQUEST = 'Request',
  MATCH = 'Match',
  CAMP = 'Camp',
  SYSTEM = 'System'
}

export enum NotificationChannel {
  IN_APP = 'In-app',
  EMAIL = 'Email',
  SMS = 'SMS'
}

export enum DeliveryStatus {
  PENDING = 'Pending',
  SENT = 'Sent',
  FAILED = 'Failed'
}

export interface Notification {
  id: string;
  created_at: string;
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_entity_id: string | null;
  related_entity_type: string | null;
  is_read: boolean;
  read_at: string | null;
  delivery_status: DeliveryStatus;
  channel: NotificationChannel;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  urgentBloodRequests: boolean;
  donationCampUpdates: boolean;
  matchNotifications: boolean;
  systemAnnouncements: boolean;
}

export interface NotificationFilters {
  type?: NotificationType;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

export interface NotificationCreateData {
  recipient_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_entity_id?: string;
  related_entity_type?: string;
  channel: NotificationChannel;
}

export interface NotificationBatchCreateData {
  recipient_ids: string[];
  type: NotificationType;
  title: string;
  message: string;
  related_entity_id?: string;
  related_entity_type?: string;
  channel: NotificationChannel;
}

export interface NotificationStats {
  totalCount: number;
  unreadCount: number;
  requestCount: number;
  matchCount: number;
  campCount: number;
  systemCount: number;
} 