import { useState, useEffect, useMemo, useRef } from "react";
import { Bell, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/utils";
import type { Notification, NotificationFilters } from "../types";
import { useNotifications } from "../hooks/useNotifications";
import { formatRelativeTime, getNotificationEmoji, getPriorityTone, sortNotificationsByDate } from "../utils/notificationUtils";
import { NotificationToggle } from "./NotificationToggle";

const UNREAD_FILTER: NotificationFilters = { status: "unread" };

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    filteredNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(activeTab === "unread" ? UNREAD_FILTER : undefined);
  const navigate = useNavigate();
  const prevUnreadCountRef = useRef(unreadCount);

  const recentNotifications = useMemo(() => {
    return sortNotificationsByDate(filteredNotifications).slice(0, 10);
  }, [filteredNotifications]);

  // Auto-open dropdown when new notifications arrive
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      setIsOpen(true);
    }
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      // For work order notifications, pass the work order ID to open detail view
      if (notification.type === "work_order" && notification.sourceId) {
        void navigate(notification.actionUrl, {
          state: { workOrderId: notification.sourceId, openDetail: true }
        });
      } else if (notification.type === "warranty") {
        // For warranty notifications, navigate to coverage page claim tab with prefilled data
        void navigate("/insurance?tab=claims", {
          state: { 
            openClaimForm: true,
            warrantyData: notification.metadata,
            notificationId: notification.id
          }
        });
      } else {
        void navigate(notification.actionUrl);
      }
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    markAsRead(notificationId);
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotification(notificationId);
  };

  const handleViewAll = () => {
    void navigate("/notifications");
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-gray-700" />
        ) : (
          <Bell className="h-5 w-5 text-gray-700" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
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
            onClick={() => { setIsOpen(false); }}
          />
          <div className="absolute right-0 mt-2 w-[440px] rounded-2xl bg-white shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-gray-900">Notifications</h3>
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
                <Bell className="h-12 w-12 mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div>
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      handleNotificationClick(notification);
                    }}
                    className={cn(
                      "group flex gap-3 px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-100",
                      notification.status === "unread" && "bg-yellow-50/50 border-l-4 border-yellow-200/50 shadow-sm"
                    )}
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 pt-1">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-xl",
                        getPriorityTone(notification.priority)
                      )}>
                        <span aria-hidden="true">{getNotificationEmoji(notification.type)}</span>
                        <span className="sr-only">
                          {notification.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[15px] font-medium text-gray-900 mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-[13px] text-gray-500 mb-1.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>{formatRelativeTime(notification.createdAt)}</span>
                        {notification.sourceModule && (
                          <>
                            <span>•</span>
                            <span>{notification.sourceModule}</span>
                          </>
                        )}
                      </div>

                      {/* Action Buttons for requests/approvals */}
                      {notification.type === "approval" && notification.status === "unread" && (
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              handleMarkAsRead(e, notification.id);
                            }}
                            className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              handleDelete(e, notification.id);
                            }}
                            className="px-4 py-1.5 rounded-full text-xs font-medium text-gray-900 hover:bg-gray-100 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4">
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full text-center text-sm font-medium text-gray-900 hover:text-gray-700 underline transition-colors"
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
