import { useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import type { CreateNotificationData } from '@/types/notification';

/**
 * Hook to send notifications from any module
 * 
 * Example usage:
 * ```tsx
 * const { sendNotification } = useNotifications();
 * 
 * // Send a notification when work order is assigned
 * sendNotification({
 *   type: 'work_order',
 *   priority: 'high',
 *   title: 'New Work Order Assigned',
 *   message: `You have been assigned to work order ${workOrderId}`,
 *   sourceModule: 'work-order',
 *   sourceId: workOrderId,
 *   actionUrl: '/work-orders',
 *   actionLabel: 'View Work Order',
 *   metadata: { workOrderId, assetCode, technicianName }
 * });
 * ```
 */
export const useNotifications = () => {
  const sendNotification = useCallback((data: CreateNotificationData) => {
    return notificationService.createNotification(data);
  }, []);

  const getUnreadCount = useCallback(() => {
    return notificationService.getUnreadCount();
  }, []);

  const markAsRead = useCallback((id: string) => {
    return notificationService.markAsRead(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    return notificationService.markAllAsRead();
  }, []);

  return {
    sendNotification,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};
