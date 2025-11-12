import { useCallback, useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { Bell, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/utils";
import type { Notification } from "../types";
import { useNotifications } from "../hooks/useNotifications";
import { useNotificationPanel } from "../hooks/useNotificationPanel";
import { formatRelativeTime, sortNotificationsByDate } from "../utils/notificationUtils";
import { navigateForNotification } from "../utils/notificationNavigation";
import { NotificationToggle } from "./NotificationToggle";
import { MAX_RECENT_NOTIFICATIONS, NOTIFICATION_TYPE_ICONS, UNREAD_ONLY_FILTER } from "../constants";

export const NotificationBell = () => {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const {
    filteredNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(activeTab === "unread" ? UNREAD_ONLY_FILTER : undefined);
  const navigate = useNavigate();
  const { close, containerRef, isOpen, panelId, toggle } = useNotificationPanel({ unreadCount });

  const recentNotifications = useMemo(() => {
    return sortNotificationsByDate(filteredNotifications).slice(0, MAX_RECENT_NOTIFICATIONS);
  }, [filteredNotifications]);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      markAsRead(notification.id);
      navigateForNotification(notification, navigate, { onNavigate: close });
    },
    [close, markAsRead, navigate],
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  const handleMarkAsRead = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>, notificationId: string) => {
      event.stopPropagation();
      markAsRead(notificationId);
    },
    [markAsRead],
  );

  const handleDelete = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>, notificationId: string) => {
      event.stopPropagation();
      deleteNotification(notificationId);
    },
    [deleteNotification],
  );

  const handleViewAll = useCallback(() => {
    void navigate("/notifications");
    close();
  }, [close, navigate]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Icon Button */}
      <button
        type="button"
        onClick={toggle}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-gray-700" />
        ) : (
          <Bell className="h-5 w-5 text-gray-700" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0 -right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/10 animate-in fade-in-0 duration-200 z-40"
            onClick={close}
          />
          <div
            id={panelId}
            className="absolute right-0 mt-2 w-[440px] rounded-2xl bg-white shadow-2xl z-50 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-dropdown-title"
          >
            {/* Header */}
            <div className="px-6 pt-6 pb-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 id="notification-dropdown-title" className="text-2xl font-bold text-gray-900">
                  Notifications
                </h3>
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className={cn(
                    "text-sm font-medium text-gray-900 transition-colors underline hover:text-gray-700",
                    unreadCount === 0 && "pointer-events-none opacity-50 no-underline",
                  )}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </button>
              </div>

              {/* Tabs */}
              <NotificationToggle activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell className="mb-2 h-12 w-12 text-gray-300" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div>
                  {recentNotifications.map((notification) => {
                    const Icon = NOTIFICATION_TYPE_ICONS[notification.type];

                    return (
                      <div
                        key={notification.id}
                        onClick={() => {
                          handleNotificationClick(notification);
                        }}
                        className={cn(
                          "group flex cursor-pointer gap-3 border-t border-gray-100 px-6 py-4 transition-colors hover:bg-gray-50",
                          notification.status === "unread" &&
                            "bg-yellow-50/50 border-l-4 border-yellow-200/50 shadow-sm",
                        )}
                      >
                        {/* Icon */}
                        <div className="flex-shrink-0 pt-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <Icon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                            <span className="sr-only">{notification.type.replace(/_/g, " ")}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <h4 className="mb-1 text-[15px] font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="mb-1.5 text-[13px] text-gray-500 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formatRelativeTime(notification.createdAt)}</span>
                          </div>

                          {/* Action Buttons for requests/approvals */}
                          {notification.type === "approval" && notification.status === "unread" && (
                            <div className="mt-3 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  handleMarkAsRead(e, notification.id);
                                }}
                                className="rounded-full bg-gray-900 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  handleDelete(e, notification.id);
                                }}
                                className="rounded-full px-4 py-1.5 text-xs font-medium text-gray-900 transition-colors hover:bg-gray-100"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={handleViewAll}
                className="w-full text-center text-sm font-medium text-gray-900 transition-colors hover:text-gray-700 underline"
              >
                See all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
