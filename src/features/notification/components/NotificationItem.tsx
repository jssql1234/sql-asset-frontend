import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  FileText,
  Gauge,
  Info,
  Trash2,
  Wrench,
} from "lucide-react";
import { cn } from "@/utils/utils";
import type { Notification } from "../types";
import { formatRelativeTime, getPriorityBorder, getPriorityIndicator, getPriorityTone } from "../utils/notificationUtils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_ICON_MAP: Record<Notification["type"], LucideIcon> = {
  work_order: Wrench,
  work_request: FileText,
  maintenance: Wrench,
  meter_reading: Gauge,
  asset_alert: AlertTriangle,
  system: Info,
  approval: CheckCircle2,
  reminder: Bell,
};

export const NotificationItem = ({ notification, onMarkAsRead, onDelete }: NotificationItemProps) => {
  const navigate = useNavigate();
  const Icon = TYPE_ICON_MAP[notification.type];

  const handleNavigate = () => {
    if (notification.status === "unread") {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      void navigate(notification.actionUrl);
    }
  };

  const handleMarkAsRead = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete(notification.id);
  };

  const timestampLabel = formatRelativeTime(notification.createdAt);

  return (
    <article
      className={cn(
        "relative flex cursor-pointer gap-4 rounded-lg border p-4 transition-all hover:border-primary/30 hover:shadow-md",
        notification.status === "unread"
          ? "bg-primaryContainer/10 border-primary/20"
          : "bg-surface border-outlineVariant",
      )}
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleNavigate();
        }
      }}
      aria-pressed={notification.status !== "unread"}
    >
      {notification.status === "unread" && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute left-0 top-4 bottom-4 w-1 rounded-r",
            getPriorityIndicator(notification.priority),
          )}
        />
      )}

      <div
        className={cn(
          "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border",
          getPriorityTone(notification.priority),
          getPriorityBorder(notification.priority),
        )}
      >
        <Icon aria-hidden="true" className="size-5" />
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

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-onSurfaceVariant">
            <span className="rounded bg-surfaceContainerHigh px-2 py-0.5">
              {notification.sourceModule}
            </span>
            {notification.sourceId && (
              <span className="rounded bg-surfaceContainerHigh px-2 py-0.5">
                {notification.sourceId}
              </span>
            )}
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 font-medium uppercase tracking-wide",
                getPriorityBorder(notification.priority),
                getPriorityTone(notification.priority),
              )}
            >
              {notification.priority}
            </span>
          </div>

          <div className="flex items-center gap-2">
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
      </div>
    </article>
  );
};
