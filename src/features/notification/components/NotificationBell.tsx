import { useState, useEffect, useRef } from "react";
import { Bell, BellRing, X, Eye, Trash2 } from "lucide-react";
import { useNotificationContext } from "../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/utils";
import type { Notification } from "@/types/notification";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotificationContext();
  const navigate = useNavigate();

  // Get the 5 most recent unread notifications
  useEffect(() => {
    const unreadNotifications = notifications
      .filter(n => n.status === 'unread')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setRecentNotifications(unreadNotifications);
  }, [notifications]);

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
      void navigate(notification.actionUrl);
    }
    setIsOpen(false);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work_order':
        return '🔧';
      case 'work_request':
        return '📋';
      case 'maintenance':
        return '⚙️';
      case 'meter_reading':
        return '📊';
      case 'asset_alert':
        return '⚠️';
      case 'approval':
        return '✅';
      case 'reminder':
        return '⏰';
      default:
        return '📌';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${String(diffInMinutes)}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${String(diffInHours)}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${String(diffInDays)}d ago`;
    
    return date.toLocaleDateString();
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
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 text-gray-700" />
        ) : (
          <Bell className="h-5 w-5 text-gray-700" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
              }}
              className="rounded p-1 hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mb-2 text-gray-300" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      handleNotificationClick(notification);
                    }}
                    className="group flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {/* Icon */}
                    <div className="flex-shrink-0 pt-1">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg text-lg",
                        getPriorityColor(notification.priority)
                      )}>
                        {getTypeIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            handleMarkAsRead(e, notification.id);
                          }}
                          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                          title="Mark as read"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Read</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            handleDelete(e, notification.id);
                          }}
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-4 py-2">
            <button
              type="button"
              onClick={handleViewAll}
              className="w-full rounded-md py-2 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
