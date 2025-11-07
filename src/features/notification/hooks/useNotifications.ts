import { useMemo, useCallback } from "react";
import type { NotificationFilters } from "../types";
import { filterNotifications, groupNotificationsByDate } from "../utils/notificationUtils";
import { useNotificationContext } from "./useNotificationContext";
import { useToast } from "@/components/ui/components/Toast/useToast";

export const useNotifications = (filters?: NotificationFilters) => {
  const { notifications, unreadCount, ...actions } = useNotificationContext();
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

  const handleMarkAsRead = useCallback((id: string) => {
    actions.markAsRead(id);
  }, [actions]);

  const handleMarkAllAsRead = useCallback(() => {
    const count = actions.markAllAsRead();
    if (count > 0) {
      addToast({
        title: "Notifications Marked as Read",
        description: `${String(count)} notification${count !== 1 ? "s" : ""} marked as read.`,
        variant: "success",
        duration: 3000,
      });
    }
  }, [actions, addToast]);

  const handleDelete = useCallback((id: string) => {
    const removed = actions.deleteNotification(id);
    if (removed) {
      addToast({
        title: "Notification Deleted",
        variant: "success",
        duration: 3000,
      });
    }
  }, [actions, addToast]);

  const handleClearAll = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all notifications? This action cannot be undone.")) {
      actions.clearAll();
      addToast({
        title: "All Notifications Cleared",
        variant: "success",
        duration: 3000,
      });
    }
  }, [actions, addToast]);

  return {
    notifications,
    filteredNotifications,
    groupedNotifications,
    unreadCount,
    filteredUnreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    handleDelete,
    handleClearAll,
    ...actions,
  };
};
