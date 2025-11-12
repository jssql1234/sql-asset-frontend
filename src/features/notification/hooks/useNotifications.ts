import { useCallback, useMemo } from "react";
import { useToast } from "@/components/ui/components/Toast/useToast";
import type { NotificationFilters } from "../types";
import { filterNotifications, groupNotificationsByDate } from "../utils/notificationUtils";
import { useNotificationContext } from "./useNotificationContext";

export const useNotifications = (filters?: NotificationFilters) => {
  const {
    notifications,
    unreadCount,
    refresh,
    createNotification,
    markAsRead: markAsReadBase,
    markAllAsRead: markAllAsReadBase,
    deleteNotification: deleteNotificationBase,
    deleteNotifications,
    clearAll: clearAllBase,
    getNotificationById,
  } = useNotificationContext();

  const { addToast } = useToast();

  const filteredNotifications = useMemo(() => {
    if (!filters) {
      return notifications;
    }

    return filterNotifications(notifications, filters);
  }, [filters, notifications]);

  const filteredUnreadCount = useMemo(
    () => filteredNotifications.filter((notification) => notification.status === "unread").length,
    [filteredNotifications],
  );

  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(filteredNotifications),
    [filteredNotifications],
  );

  const markAsRead = useCallback(
    (id: string) => {
      markAsReadBase(id);
    },
    [markAsReadBase],
  );

  const markAllAsRead = useCallback(() => {
    const count = markAllAsReadBase();
    if (count > 0) {
      addToast({
        title: "Notifications Marked as Read",
        description: `${String(count)} notification${count !== 1 ? "s" : ""} marked as read.`,
        variant: "success",
        duration: 3000,
      });
    }
    return count;
  }, [addToast, markAllAsReadBase]);

  const deleteNotification = useCallback(
    (id: string) => {
      const removed = deleteNotificationBase(id);
      if (removed) {
        addToast({
          title: "Notification Deleted",
          variant: "success",
          duration: 3000,
        });
      }
      return removed;
    },
    [addToast, deleteNotificationBase],
  );

  const clearAll = useCallback(() => {
    const confirmed =
      typeof window === "undefined"
        ? true
        : window.confirm("Are you sure you want to clear all notifications? This action cannot be undone.");

    if (!confirmed) {
      return false;
    }

    clearAllBase();
    addToast({
      title: "All Notifications Cleared",
      variant: "success",
      duration: 3000,
    });
    return true;
  }, [addToast, clearAllBase]);

  return {
    notifications,
    filteredNotifications,
    groupedNotifications,
    unreadCount,
    filteredUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refresh,
    createNotification,
    deleteNotifications,
    getNotificationById,
  };
};
