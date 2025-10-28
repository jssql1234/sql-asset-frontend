import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/layout/sidebar/AppLayout';
import { Card } from '@/components/ui/components';
import TabHeader from '@/components/TabHeader';
import Search from '@/components/Search';
import { NotificationGroup } from '../components/NotificationGroup';
import { useToast } from '@/components/ui/components/Toast/useToast';
import { notificationService } from '../services/notificationService';
import { CheckCheck, Trash2 } from 'lucide-react';
import type { 
  Notification, 
  NotificationFilters,
  NotificationGroup as NotificationGroupType 
} from '@/types/notification';

const NotificationPage: React.FC = () => {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filters, setFilters] = useState<NotificationFilters>({
    search: '',
    type: '',
    priority: '',
    status: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load notifications
  useEffect(() => {
    loadNotifications();
    
    // Listen for notification events
    const handleUpdate = () => loadNotifications();
    
    window.addEventListener('notification-created', handleUpdate);
    window.addEventListener('notification-updated', handleUpdate);
    window.addEventListener('notification-deleted', handleUpdate);
    window.addEventListener('notifications-bulk-updated', handleUpdate);

    return () => {
      window.removeEventListener('notification-created', handleUpdate);
      window.removeEventListener('notification-updated', handleUpdate);
      window.removeEventListener('notification-deleted', handleUpdate);
      window.removeEventListener('notifications-bulk-updated', handleUpdate);
    };
  }, []);

  const loadNotifications = () => {
    setIsLoading(true);
    try {
      const allNotifications = notificationService.getAllNotifications();
      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      addToast({
        title: 'Error Loading Notifications',
        description: 'Failed to load notifications. Please try again.',
        variant: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notificationService.getFilteredNotifications(filters);
  }, [notifications, filters]);

  // Group notifications by date
  const groupedNotifications = useMemo<NotificationGroupType[]>(() => {
    const groups: Record<string, Notification[]> = {};

    filteredNotifications.forEach((notification) => {
      const date = new Date(notification.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });

    return Object.entries(groups)
      .map(([date, notifs]) => ({
        date: new Date(date).toISOString(),
        notifications: notifs,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [filteredNotifications]);

  const unreadCount = useMemo(() => {
    return filteredNotifications.filter(n => n.status === 'unread').length;
  }, [filteredNotifications]);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    const count = notificationService.markAllAsRead();
    if (count > 0) {
      addToast({
        title: 'Notifications Marked as Read',
        description: `${count} notification${count !== 1 ? 's' : ''} marked as read.`,
        variant: 'success',
        duration: 3000,
      });
    }
  };

  const handleDelete = (id: string) => {
    notificationService.deleteNotification(id);
    addToast({
      title: 'Notification Deleted',
      variant: 'success',
      duration: 3000,
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      notificationService.clearAll();
      addToast({
        title: 'All Notifications Cleared',
        variant: 'success',
        duration: 3000,
      });
    }
  };

  const handleFilterChange = (key: keyof NotificationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppLayout
      breadcrumbs={[
        { label: 'Dashboard' },
        { label: 'Notifications' },
      ]}
    >
      <div className="flex flex-col gap-6 px-4 pb-4">
        <TabHeader
          title="Notifications"
          subtitle="View and manage all system notifications"
          actions={[
            {
              label: `Mark All as Read (${unreadCount})`,
              onAction: handleMarkAllAsRead,
              disabled: unreadCount === 0,
              icon: <CheckCheck className="size-4" />,
            },
            {
              label: 'Clear All',
              onAction: handleClearAll,
              disabled: notifications.length === 0,
              icon: <Trash2 className="size-4" />,
              variant: 'destructive',
            },
          ]}
        />

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Search
                searchValue={filters.search || ''}
                searchPlaceholder="Search notifications..."
                onSearch={(value) => handleFilterChange('search', value)}
                live={true}
                showLiveSearchIcon={true}
              />
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <Card className="p-6 border border-outline bg-surfaceContainer">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-sm text-onSurfaceVariant">Loading notifications...</p>
              </div>
            </div>
          ) : groupedNotifications.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <CheckCheck className="size-12 mx-auto text-onSurfaceVariant opacity-50 mb-3" />
                <h3 className="text-lg font-medium text-onSurface mb-1">No Notifications</h3>
                <p className="text-sm text-onSurfaceVariant">
                  {filters.search || filters.type || filters.priority || filters.status
                    ? 'No notifications match your filters'
                    : "You're all caught up!"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedNotifications.map((group) => (
                <NotificationGroup
                  key={group.date}
                  group={group}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Stats */}
        {!isLoading && notifications.length > 0 && (
          <div className="flex items-center justify-between text-sm text-onSurfaceVariant">
            <span>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
            {unreadCount > 0 && (
              <span className="font-medium text-primary">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationPage;
