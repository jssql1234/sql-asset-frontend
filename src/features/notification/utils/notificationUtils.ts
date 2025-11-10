import type { Notification, NotificationFilters, NotificationGroup } from "../types";

export const sortNotificationsByDate = (items: readonly Notification[]): Notification[] =>
  [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

export const filterNotifications = (
  items: readonly Notification[],
  filters: NotificationFilters,
): Notification[] => {
  const search = filters.search?.trim().toLowerCase();

  return items.filter((notification) => {
    if (search) {
      const haystack = [
        notification.title,
        notification.message,
        notification.sourceModule,
        notification.sourceId ?? "",
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(search)) {
        return false;
      }
    }

    if (filters.type && notification.type !== filters.type) {
      return false;
    }

    if (filters.status && notification.status !== filters.status) {
      return false;
    }

    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      if (Number.isFinite(from) && new Date(notification.createdAt).getTime() < from) {
        return false;
      }
    }

    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      if (Number.isFinite(to) && new Date(notification.createdAt).getTime() > to) {
        return false;
      }
    }

    return true;
  });
};

export const groupNotificationsByDate = (items: readonly Notification[]): NotificationGroup[] => {
  const groups = items.reduce<Record<string, Notification[]>>((acc, notification) => {
    const dateKey = new Date(notification.createdAt).toDateString();
    const list = acc[dateKey] ?? (acc[dateKey] = []);
    list.push(notification);
    return acc;
  }, {});

  return Object.entries(groups)
    .map(([date, notifications]) => ({
      date: new Date(date).toISOString(),
      notifications: sortNotificationsByDate(notifications),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const formatRelativeTime = (input: string, now = new Date()): string => {
  const value = new Date(input);
  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const diffMs = now.getTime() - value.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${String(diffMinutes)}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${String(diffHours)}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${String(diffDays)}d ago`;
  }

  return value.toLocaleDateString();
};

export const describeGroupDate = (input: string): string => {
  const date = new Date(input);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) {
    return "Today";
  }

  if (sameDay(date, yesterday)) {
    return "Yesterday";
  }

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: "long" });
  }

  return date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
};
