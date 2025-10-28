import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Notification } from '@/types/notification';
import { notificationService } from '../services/notificationService';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  refreshNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(() => {
    const allNotifications = notificationService.getAllNotifications();
    setNotifications(allNotifications);
    setUnreadCount(notificationService.getUnreadCount());
  }, []);

  useEffect(() => {
    refreshNotifications();

    // Listen for notification events
    const handleNotificationCreated = () => refreshNotifications();
    const handleNotificationUpdated = () => refreshNotifications();
    const handleNotificationDeleted = () => refreshNotifications();
    const handleBulkUpdate = () => refreshNotifications();

    window.addEventListener('notification-created', handleNotificationCreated);
    window.addEventListener('notification-updated', handleNotificationUpdated);
    window.addEventListener('notification-deleted', handleNotificationDeleted);
    window.addEventListener('notifications-bulk-updated', handleBulkUpdate);

    return () => {
      window.removeEventListener('notification-created', handleNotificationCreated);
      window.removeEventListener('notification-updated', handleNotificationUpdated);
      window.removeEventListener('notification-deleted', handleNotificationDeleted);
      window.removeEventListener('notifications-bulk-updated', handleBulkUpdate);
    };
  }, [refreshNotifications]);

  const markAsRead = useCallback((id: string) => {
    notificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    notificationService.markAllAsRead();
  }, []);

  const deleteNotification = useCallback((id: string) => {
    notificationService.deleteNotification(id);
  }, []);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
