import React from 'react';
import { useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/components/Button';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Wrench,
  FileText,
  Gauge,
  Trash2
} from 'lucide-react';
import type { Notification as NotificationType, NotificationPriority } from '@/types/notification';

interface NotificationItemProps {
  notification: NotificationType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const priorityColors: Record<NotificationPriority, string> = {
  low: 'bg-blue-100 text-blue-800 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
};

const priorityBadgeColors: Record<NotificationPriority, string> = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

const typeIcons = {
  work_order: Wrench,
  work_request: FileText,
  maintenance: Wrench,
  meter_reading: Gauge,
  asset_alert: AlertTriangle,
  system: Info,
  approval: CheckCircle,
  reminder: Bell,
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const navigate = useNavigate();
  const Icon = typeIcons[notification.type] || Bell;

  const handleClick = () => {
    if (notification.status === 'unread') {
      onMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

//   const handleActionClick = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (notification.status === 'unread') {
//       onMarkAsRead(notification.id);
//     }
//     if (notification.actionUrl) {
//       navigate(notification.actionUrl);
//     }
//   };

//   const handleDelete = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     onDelete(notification.id);
//   };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));

    // If less than 1 minute
    if (diffInMins < 1) return 'Just now';
    
    // If less than 60 minutes, show minutes
    if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
    
    // Check if same day
    const isSameDay = date.toDateString() === now.toDateString();
    
    if (isSameDay) {
      // Same day - show time
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // Different day - show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  return (
    <div
      className={`
        relative flex gap-4 p-4 rounded-lg border transition-all cursor-pointer
        hover:shadow-md hover:border-primary/30
        ${notification.status === 'unread' ? 'bg-primaryContainer/10 border-primary/20' : 'bg-surface border-outlineVariant'}
      `}
      onClick={handleClick}
    >
      {/* Priority Indicator */}
      {notification.status === 'unread' && (
        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r ${priorityBadgeColors[notification.priority]}`} />
      )}

      {/* Icon */}
      <div className={`
        flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border
        ${priorityColors[notification.priority]}
      `}>
        <Icon className="size-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className={`font-medium text-onSurface ${notification.status === 'unread' ? 'font-semibold' : ''}`}>
            {notification.title}
          </h4>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-onSurfaceVariant">
              {formatDate(notification.createdAt)}
            </span>
            {notification.status === 'unread' && (
              <div className="w-2 h-2 rounded-full bg-primary" title="Unread" />
            )}
          </div>
        </div>

        <p className="text-sm text-onSurfaceVariant mb-2 line-clamp-2">
          {notification.message}
        </p>

        {/* Metadata */}
        {/* <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded bg-surfaceContainerHigh text-onSurface">
            {notification.sourceModule}
          </span>
          {notification.sourceId && (
            <span className="text-xs px-2 py-0.5 rounded bg-surfaceContainerHigh text-onSurface">
              {notification.sourceId}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[notification.priority]}`}>
            {notification.priority.toUpperCase()}
          </span>
        </div> */}

        {/* Actions */}
        {/* {notification.actionUrl && notification.actionLabel && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleActionClick}
              className="text-xs"
            >
              {notification.actionLabel}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              className="text-xs text-error hover:bg-errorContainer"
            >
              <Trash2 className="size-3 mr-1" />
              Delete
            </Button>
          </div>
        )} */}
      </div>
    </div>
  );
};
