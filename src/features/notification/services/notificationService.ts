import type { Notification, CreateNotificationData, NotificationFilters } from '@/types/notification';

const STORAGE_KEY = 'sql_asset_notifications';

class NotificationService {
  private notifications: Notification[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      } else {
        // Initialize with some sample notifications
        this.notifications = this.getSampleNotifications();
        this.saveToStorage();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  private getSampleNotifications(): Notification[] {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(now);
    lastWeek.setDate(lastWeek.getDate() - 7);

    return [
      {
        id: '1',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
            {
        id: '11',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
            {
        id: '12',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },      {
        id: '13',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
            {
        id: '14',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
            {
        id: '15',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
            {
        id: '16',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
            {
        id: '17',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
                  {
        id: '21',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
                  {
        id: '18',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
                  {
        id: '19',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },
                  {
        id: '20',
        type: 'maintenance',
        priority: 'high',
        status: 'unread',
        title: 'Work Order #WO-2025-001 Assigned',
        message: 'You have been assigned to work order WO-2025-001: Repair Excavator - EXC-001',
        sourceModule: 'work-order',
        sourceId: 'WO-2025-001',
        actionUrl: '/work-orders',
        actionLabel: 'View Work Order',
        createdAt: now.toISOString(),
        createdBy: 'System',
      },

      {
        id: '2',
        type: 'meter_reading',
        priority: 'urgent',
        status: 'unread',
        title: 'Meter Reading Alert',
        message: 'Engine hours for Bulldozer BD-002 exceeded threshold (5000 hours)',
        sourceModule: 'meter-reading',
        sourceId: 'MTR-001',
        actionUrl: '/meter-reading',
        actionLabel: 'Check Meter',
        metadata: { assetCode: 'BD-002', currentReading: 5050, threshold: 5000 },
        createdAt: now.toISOString(),
      },
      {
        id: '3',
        type: 'work_request',
        priority: 'medium',
        status: 'read',
        title: 'Work Request Approved',
        message: 'Work request WR-2025-015 has been approved and converted to work order',
        sourceModule: 'work-request',
        sourceId: 'WR-2025-015',
        actionUrl: '/work-request',
        actionLabel: 'View Request',
        createdAt: yesterday.toISOString(),
        readAt: yesterday.toISOString(),
      },
      {
        id: '4',
        type: 'maintenance',
        priority: 'medium',
        status: 'unread',
        title: 'Scheduled Maintenance Due',
        message: 'Preventive maintenance for Generator GEN-003 is due in 3 days',
        sourceModule: 'work-order',
        sourceId: 'PM-2025-089',
        actionUrl: '/work-orders',
        actionLabel: 'Schedule Maintenance',
        createdAt: yesterday.toISOString(),
      },
      {
        id: '5',
        type: 'asset_alert',
        priority: 'high',
        status: 'read',
        title: 'Asset Downtime Alert',
        message: 'Forklift FK-005 has been down for 48 hours',
        sourceModule: 'downtime-tracking',
        sourceId: 'FK-005',
        actionUrl: '/downtime-tracking',
        actionLabel: 'View Downtime',
        createdAt: lastWeek.toISOString(),
        readAt: lastWeek.toISOString(),
      },
    ];
  }

  getAllNotifications(): Notification[] {
    return [...this.notifications];
  }

  getNotificationById(id: string): Notification | undefined {
    return this.notifications.find(n => n.id === id);
  }

  getFilteredNotifications(filters: NotificationFilters): Notification[] {
    let filtered = [...this.notifications];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        n.message.toLowerCase().includes(searchLower) ||
        n.sourceModule.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(n => n.priority === filters.priority);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(n => n.status === filters.status);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(filters.dateFrom!));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(n => new Date(n.createdAt) <= new Date(filters.dateTo!));
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return filtered;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => n.status === 'unread').length;
  }

  createNotification(data: CreateNotificationData): Notification {
    const newNotification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage();

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('notification-created', { 
      detail: newNotification 
    }));

    return newNotification;
  }

  markAsRead(id: string): boolean {
    const notification = this.notifications.find(n => n.id === id);
    if (notification && notification.status === 'unread') {
      notification.status = 'read';
      notification.readAt = new Date().toISOString();
      this.saveToStorage();

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('notification-updated', { 
        detail: notification 
      }));

      return true;
    }
    return false;
  }

  markAllAsRead(): number {
    let count = 0;
    const now = new Date().toISOString();
    
    this.notifications.forEach(n => {
      if (n.status === 'unread') {
        n.status = 'read';
        n.readAt = now;
        count++;
      }
    });

    if (count > 0) {
      this.saveToStorage();
      window.dispatchEvent(new CustomEvent('notifications-bulk-updated'));
    }

    return count;
  }

  deleteNotification(id: string): boolean {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.saveToStorage();

      window.dispatchEvent(new CustomEvent('notification-deleted', { 
        detail: { id } 
      }));

      return true;
    }
    return false;
  }

  deleteMultipleNotifications(ids: string[]): number {
    let count = 0;
    ids.forEach(id => {
      const index = this.notifications.findIndex(n => n.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
        count++;
      }
    });

    if (count > 0) {
      this.saveToStorage();
      window.dispatchEvent(new CustomEvent('notifications-bulk-updated'));
    }

    return count;
  }

  archiveNotification(id: string): boolean {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.status = 'archived';
      this.saveToStorage();

      window.dispatchEvent(new CustomEvent('notification-updated', { 
        detail: notification 
      }));

      return true;
    }
    return false;
  }

  clearAll(): void {
    this.notifications = [];
    this.saveToStorage();
    window.dispatchEvent(new CustomEvent('notifications-bulk-updated'));
  }
}

export const notificationService = new NotificationService();
