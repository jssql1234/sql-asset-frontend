export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'unread' | 'read' | 'archived';
export type NotificationType = 
  | 'work_order' 
  | 'work_request' 
  | 'maintenance' 
  | 'meter_reading'
  | 'asset_alert'
  | 'system'
  | 'approval'
  | 'reminder';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  title: string;
  message: string;
  sourceModule: string; // e.g., 'work-order', 'meter-reading', 'asset'
  sourceId?: string; // ID of the related entity
  actionUrl?: string; // URL to navigate when clicked
  actionLabel?: string; // Label for action button
  metadata?: Record<string, any>; // Additional data from source module
  createdAt: string;
  readAt?: string;
  createdBy?: string;
  assignedTo?: string[]; // User IDs who should see this notification
}

export interface NotificationGroup {
  date: string; // ISO date string for grouping (e.g., "2025-10-28")
  notifications: Notification[];
}

export interface NotificationFilters {
  search?: string;
  type?: NotificationType | '';
  priority?: NotificationPriority | '';
  status?: NotificationStatus | '';
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateNotificationData {
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  sourceModule: string;
  sourceId?: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  assignedTo?: string[];
}
