import type { NavigateFunction } from "react-router-dom";
import type { 
	Notification, 
	WarrantyNotificationMetadata, 
	InsuranceNotificationMetadata,
	ClaimNotificationMetadata,
} from "../types";

interface NavigateNotificationOptions {
	readonly onNavigate?: () => void;
}

/**
 * Type guard to check if metadata is warranty notification metadata
 */
function isWarrantyMetadata(metadata: unknown): metadata is WarrantyNotificationMetadata {
	return (
		typeof metadata === "object" &&
		metadata !== null &&
		"warrantyId" in metadata
	);
}

/**
 * Type guard to check if metadata is insurance notification metadata
 */
function isInsuranceMetadata(metadata: unknown): metadata is InsuranceNotificationMetadata {
	return (
		typeof metadata === "object" &&
		metadata !== null &&
		"insuranceId" in metadata
	);
}

/**
 * Type guard to check if metadata is claim notification metadata
 */
function isClaimMetadata(metadata: unknown): metadata is ClaimNotificationMetadata {
	return (
		typeof metadata === "object" &&
		metadata !== null &&
		"claimId" in metadata
	);
}

/**
 * Navigate to the destination implied by a notification, handling special cases for
 * work orders, warranty, insurance, and claim notifications.
 */
export const navigateForNotification = (
	notification: Notification,
	navigate: NavigateFunction,
	options?: NavigateNotificationOptions,
): void => {
	const { onNavigate } = options ?? {};

	if (!notification.actionUrl) {
		onNavigate?.();
		return;
	}

	// Handle work order notifications
	if (notification.type === "work_order" && notification.sourceId) {
		void navigate(notification.actionUrl, {
			state: { 
				workOrderId: notification.sourceId, 
				openDetail: true,
			},
		});
		onNavigate?.();
		return;
	}

	// Handle warranty notifications
	if (notification.type === "warranty") {
		const warrantyId = isWarrantyMetadata(notification.metadata)
			? notification.metadata.warrantyId
			: undefined;

		void navigate("/insurance?tab=claims", {
			state: {
				openClaimForm: true,
				warrantyId,
				warrantyData: notification.metadata,
				notificationId: notification.id,
			},
		});
		onNavigate?.();
		return;
	}

	// Handle insurance notifications
	if (notification.type === "insurance") {
		const insuranceId = isInsuranceMetadata(notification.metadata)
			? notification.metadata.insuranceId
			: undefined;

		void navigate("/insurance?tab=claims", {
			state: {
				openClaimForm: true,
				insuranceId,
				insuranceData: notification.metadata,
				notificationId: notification.id,
			},
		});
		onNavigate?.();
		return;
	}

	// Handle claim notifications
	if (notification.type === "claim" && notification.sourceId) {
		const claimId = isClaimMetadata(notification.metadata)
			? notification.metadata.claimId ?? notification.sourceId
			: notification.sourceId;

		void navigate("/work-orders", {
			state: {
				openWorkOrderForm: true,
				claimId,
				claimData: notification.metadata,
				notificationId: notification.id,
			},
		});
		onNavigate?.();
		return;
	}

	// Default navigation
	void navigate(notification.actionUrl);
	onNavigate?.();
};

