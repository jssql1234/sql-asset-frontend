import { createMockNotifications } from "../mockData";
import { filterNotifications, sortNotificationsByDate } from "../utils/notificationUtils";
import type {
  CreateNotificationData,
  Notification,
  NotificationFilters,
  NotificationListener,
} from "../types";

const STORAGE_KEY = "sql_asset_notifications";
const isBrowser = typeof window !== "undefined";

let notifications: Notification[] = [];
let hydrated = false;
const listeners = new Set<NotificationListener>();

const clone = (items: Notification[]): Notification[] => items.map((item) => ({ ...item }));

const readFromStorage = (): Notification[] => {
  if (!isBrowser) {
    return sortNotificationsByDate(createMockNotifications());
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return sortNotificationsByDate(createMockNotifications());
    }

    const parsed = JSON.parse(stored) as Notification[];
    return sortNotificationsByDate(parsed);
  } catch (error) {
    console.error("Failed to load notifications from storage", error);
    return sortNotificationsByDate(createMockNotifications());
  }
};

const persist = () => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error("Failed to persist notifications", error);
  }
};

const ensureHydrated = () => {
  if (hydrated) {
    return;
  }

  notifications = readFromStorage();
  hydrated = true;
};

const notifySubscribers = () => {
  persist();
  listeners.forEach((listener) => {
    listener();
  });
};

const setNotifications = (next: Notification[]) => {
  ensureHydrated();
  notifications = sortNotificationsByDate(next);
  notifySubscribers();
};

const mutateNotifications = (updater: (draft: Notification[]) => void) => {
  ensureHydrated();
  const draft = clone(notifications);
  updater(draft);
  setNotifications(draft);
};

const generateId = () => {
  if (isBrowser && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `notif-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
};

const getSnapshot = (): readonly Notification[] => {
  ensureHydrated();
  return notifications;
};

export const notificationService = {
  subscribe(listener: NotificationListener) {
    ensureHydrated();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  getSnapshot,

  getServerSnapshot(): Notification[] {
    return [];
  },

  refresh(): void {
    ensureHydrated();
    notifySubscribers();
  },

  getAllNotifications(): Notification[] {
    return clone(notifications);
  },

  getNotificationById(id: string): Notification | undefined {
    ensureHydrated();
    return notifications.find((notification) => notification.id === id);
  },

  getFilteredNotifications(filters: NotificationFilters): Notification[] {
    ensureHydrated();
    return filterNotifications(notifications, filters);
  },

  getUnreadCount(): number {
    ensureHydrated();
    return notifications.reduce(
      (count, notification) => (notification.status === "unread" ? count + 1 : count),
      0,
    );
  },

  createNotification(data: CreateNotificationData): Notification {
    const newNotification: Notification = {
      id: generateId(),
      status: "unread",
      createdAt: new Date().toISOString(),
      ...data,
    };

    mutateNotifications((draft) => {
      draft.unshift(newNotification);
    });

    return newNotification;
  },

  markAsRead(id: string): boolean {
    let updated = false;

    mutateNotifications((draft) => {
      const index = draft.findIndex((notification) => notification.id === id);
      if (index === -1) {
        return;
      }

      const current = draft[index];
      if (current.status !== "unread") {
        return;
      }

      draft[index] = {
        ...current,
        status: "read",
        readAt: new Date().toISOString(),
      };

      updated = true;
    });

    return updated;
  },

  markAllAsRead(): number {
    let count = 0;

    mutateNotifications((draft) => {
      const timestamp = new Date().toISOString();
      draft.forEach((notification, index) => {
        if (notification.status === "unread") {
          draft[index] = {
            ...notification,
            status: "read",
            readAt: timestamp,
          };
          count += 1;
        }
      });
    });

    return count;
  },

  deleteNotification(id: string): boolean {
    let deleted = false;

    mutateNotifications((draft) => {
      const next = draft.filter((notification) => notification.id !== id);
      if (next.length !== draft.length) {
        deleted = true;
        draft.splice(0, draft.length, ...next);
      }
    });

    return deleted;
  },

  deleteMultipleNotifications(ids: string[]): number {
    const removalSet = new Set(ids);
    let deleted = 0;

    mutateNotifications((draft) => {
      const next = draft.filter((notification) => {
        if (removalSet.has(notification.id)) {
          deleted += 1;
          return false;
        }
        return true;
      });

      if (deleted > 0) {
        draft.splice(0, draft.length, ...next);
      }
    });

    return deleted;
  },

  archiveNotification(id: string): boolean {
    let archived = false;

    mutateNotifications((draft) => {
      const index = draft.findIndex((notification) => notification.id === id);
      if (index === -1) {
        return;
      }

      draft[index] = {
        ...draft[index],
        status: "archived",
      };
      archived = true;
    });

    return archived;
  },

  clearAll(): void {
    setNotifications([]);
  },
};

export type NotificationService = typeof notificationService;
