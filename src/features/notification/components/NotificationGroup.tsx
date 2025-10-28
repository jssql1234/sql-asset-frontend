import React from 'react';
import { NotificationItem } from './NotificationItem';
import type { NotificationGroup as NotificationGroupType } from '@/types/notification';

interface NotificationGroupProps {
  group: NotificationGroupType;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export const NotificationGroup: React.FC<NotificationGroupProps> = ({
  group,
  onMarkAsRead,
  onDelete,
}) => {
  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    const diffInDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
    });
  };

  return (
    <div className="space-y-3">
      {/* Group Header */}
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-onSurface">
          {formatGroupDate(group.date)}
        </h3>
        <div className="flex-1 h-px bg-outlineVariant" />
        {/* <span className="text-xs text-onSurfaceVariant">
          {group.notifications.length} notification{group.notifications.length !== 1 ? 's' : ''}
        </span> */}
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {group.notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
