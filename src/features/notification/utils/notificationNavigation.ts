import type { NavigateFunction } from "react-router-dom";
import type { Notification } from "../types";

interface NavigateNotificationOptions {
  readonly onNavigate?: () => void;
}

/**
 * Navigate to the destination implied by a notification, handling special cases for
 * work orders and warranty notifications.
 */
export const navigateForNotification = (
  notification: Notification,
  navigate: NavigateFunction,
  options?: NavigateNotificationOptions,
): void => {
  if (!notification.actionUrl) {
    options?.onNavigate?.();
    return;
  }

  if (notification.type === "work_order" && notification.sourceId) {
    void navigate(notification.actionUrl, {
      state: { workOrderId: notification.sourceId, openDetail: true },
    });
    options?.onNavigate?.();
    return;
  }

  if (notification.type === "warranty") {
    void navigate("/insurance?tab=claims", {
      state: {
        openClaimForm: true,
        warrantyData: notification.metadata,
        notificationId: notification.id,
      },
    });
    options?.onNavigate?.();
    return;
  }

  void navigate(notification.actionUrl);
  options?.onNavigate?.();
};
