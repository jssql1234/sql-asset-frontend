import { useMemo } from "react";
import type { NotificationFilters } from "../types";
import { filterNotifications, groupNotificationsByDate } from "../utils/notificationUtils";
import { useNotificationContext } from "./useNotificationContext";

export const useNotifications = (filters?: NotificationFilters) => {
  const { notifications, unreadCount, ...actions } = useNotificationContext();

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

  return {
    notifications,
    filteredNotifications,
    groupedNotifications,
    unreadCount,
    filteredUnreadCount,
    ...actions,
  };
};
