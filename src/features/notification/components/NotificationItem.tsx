import { useCallback, type KeyboardEvent, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { cn } from "@/utils/utils";
import type { Notification } from "../types";
import { formatRelativeTime } from "../utils/notificationUtils";
import { navigateForNotification } from "../utils/notificationNavigation";
import { NOTIFICATION_TYPE_ICONS } from "../constants";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationItem = ({ notification, onMarkAsRead, onDelete }: NotificationItemProps) => {
  const navigate = useNavigate();
  const Icon = NOTIFICATION_TYPE_ICONS[notification.type];

  const handleNavigate = useCallback(() => {
    if (notification.status === "unread") {
      onMarkAsRead(notification.id);
    }

    navigateForNotification(notification, navigate);
  }, [navigate, notification, onMarkAsRead]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleNavigate();
      }
    },
    [handleNavigate],
  );

  const handleMarkAsRead = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onMarkAsRead(notification.id);
    },
    [notification.id, onMarkAsRead],
  );

  const handleDelete = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onDelete(notification.id);
    },
    [notification.id, onDelete],
  );

  const timestampLabel = formatRelativeTime(notification.createdAt);

  return (
    <article
      className={cn(
        "relative flex cursor-pointer gap-4 rounded-lg border p-4 transition-all hover:border-primary/30 hover:shadow-md",
        notification.status === "unread"
          ? "bg-yellow-50/50 border-yellow-200/50 shadow-sm"
          : "bg-surface border-outlineVariant",
      )}
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gray-100 bg-gray-100">
        <Icon aria-hidden="true" className="size-5 text-gray-600" />
        <span className="sr-only">{notification.type.replace(/_/g, " ")}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h4
            className={cn("text-base font-medium text-onSurface", {
              "font-semibold": notification.status === "unread",
            })}
          >
            {notification.title}
          </h4>
          <div className="flex items-center gap-2 text-xs text-onSurfaceVariant">
            <time dateTime={notification.createdAt}>{timestampLabel}</time>
            {notification.status === "unread" && <span className="sr-only">Unread notification</span>}
          </div>
        </div>

        <p className="text-sm text-onSurfaceVariant line-clamp-2">{notification.message}</p>

        <div className="flex items-center justify-end gap-2">
          {notification.status === "unread" && (
            <button
              type="button"
              onClick={handleMarkAsRead}
              className="rounded border border-primary/30 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
            >
              Mark as read
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="rounded border border-error/20 p-1 text-error transition-colors hover:bg-error/10"
            aria-label="Delete notification"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};
