import { createMockNotifications } from "../mockData";
import { sortNotificationsByDate } from "../utils/notificationUtils";
import type { CreateNotificationData, Notification, NotificationListener } from "../types";

let notifications: Notification[] = [];
let initialized = false;
const listeners = new Set<NotificationListener>();

const clone = (items: Notification[]): Notification[] => items.map((item) => ({ ...item }));

const initializeMockData = (): void => {
  if (initialized) {
    return;
  }

  notifications = sortNotificationsByDate(createMockNotifications());
  initialized = true;
};

const notifySubscribers = () => {
  listeners.forEach((listener) => {
    listener();
  });
};

const setNotifications = (next: Notification[]) => {
  initializeMockData();
  notifications = sortNotificationsByDate(next);
  notifySubscribers();
};

const mutateNotifications = (updater: (draft: Notification[]) => void) => {
  initializeMockData();
  const draft = clone(notifications);
  updater(draft);
  setNotifications(draft);
};

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `notif-${String(Date.now())}-${Math.random().toString(36).slice(2, 8)}`;
};

const getSnapshot = (): readonly Notification[] => {
  initializeMockData();
  return notifications;
};

export const notificationService = {
  subscribe(listener: NotificationListener) {
    initializeMockData();
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
    initializeMockData();
    notifySubscribers();
  },

  getNotificationById(id: string): Notification | undefined {
    initializeMockData();
    return notifications.find((notification) => notification.id === id);
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

  clearAll(): void {
    setNotifications([]);
  },
};

export type NotificationService = typeof notificationService;
