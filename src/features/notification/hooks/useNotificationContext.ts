import { createContext, createElement, use, useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { notificationService } from "../services/notificationService";
import type { CreateNotificationData, Notification } from "../types";

export interface NotificationContextValue {
  readonly notifications: readonly Notification[];
  readonly unreadCount: number;
  refresh: () => void;
  createNotification: (input: CreateNotificationData) => Notification;
  markAsRead: (id: string) => boolean;
  markAllAsRead: () => number;
  deleteNotification: (id: string) => boolean;
  deleteNotifications: (ids: string[]) => number;
  clearAll: () => void;
  getNotificationById: (id: string) => Notification | undefined;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

interface NotificationProviderProps {
  readonly children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const subscribe = useCallback(
    (listener: () => void) => notificationService.subscribe(listener),
    [],
  );

  const getSnapshot = useCallback(() => notificationService.getSnapshot(), []);

  const getServerSnapshot = useCallback(() => notificationService.getServerSnapshot(), []);

  const notifications = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.status === "unread").length,
    [notifications],
  );

  const refresh = useCallback(() => {
    notificationService.refresh();
  }, []);

  const createNotification = useCallback(
    (input: CreateNotificationData) => notificationService.createNotification(input),
    [],
  );

  const markAsRead = useCallback((id: string) => notificationService.markAsRead(id), []);

  const markAllAsRead = useCallback(() => notificationService.markAllAsRead(), []);

  const deleteNotification = useCallback((id: string) => notificationService.deleteNotification(id), []);

  const deleteNotifications = useCallback(
    (ids: string[]) => notificationService.deleteMultipleNotifications(ids),
    [],
  );

  const clearAll = useCallback(() => {
    notificationService.clearAll();
  }, []);

  const getNotificationById = useCallback(
    (id: string) => notificationService.getNotificationById(id),
    [],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      refresh,
      createNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      deleteNotifications,
      clearAll,
      getNotificationById,
    }),
    [
      clearAll,
      createNotification,
      deleteNotification,
      deleteNotifications,
      getNotificationById,
      markAllAsRead,
      markAsRead,
      notifications,
      refresh,
      unreadCount,
    ],
  );

  return createElement(NotificationContext.Provider, { value }, children);
};

export const useNotificationContext = (): NotificationContextValue => {
  const context = use(NotificationContext);

  if (!context) {
    throw new Error("useNotificationContext must be used within a NotificationProvider");
  }

  return context;
};
