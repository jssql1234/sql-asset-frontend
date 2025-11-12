export type NotificationStatus = "unread" | "read" | "archived";

export type NotificationType =
	| "work_order"
	| "work_request"
	| "maintenance"
	| "meter_reading"
	| "asset_alert"
	| "system"
	| "approval"
	| "reminder"
	| "warranty"
	| "insurance"
	| "claim";

export interface Notification {
	id: string;
	type: NotificationType;
	status: NotificationStatus;
	title: string;
	message: string;
	sourceModule: string;
	sourceId?: string;
	actionUrl?: string;
	actionLabel?: string;
	metadata?: Record<string, unknown>;
	createdAt: string;
	readAt?: string;
	createdBy?: string;
	assignedTo?: string[];
}

export interface NotificationGroup {
	date: string;
	notifications: Notification[];
}

export interface NotificationFilters {
	search?: string;
	type?: NotificationType | "";
	status?: NotificationStatus | "";
	dateFrom?: string;
	dateTo?: string;
}

export interface CreateNotificationData {
	type: NotificationType;
	title: string;
	message: string;
	sourceModule: string;
	sourceId?: string;
	actionUrl?: string;
	actionLabel?: string;
	metadata?: Record<string, unknown>;
	assignedTo?: string[];
}

export type NotificationListener = () => void;

// Notification metadata type definitions for cross-module integrations

/**
 * Asset information for notification metadata
 */
export interface NotificationAsset {
	readonly id: string;
	readonly name: string;
}

/**
 * Warranty notification metadata
 * Used when navigating from work order to warranty claim
 */
export interface WarrantyNotificationMetadata {
	readonly warrantyId?: string;
	readonly warrantyName?: string;
	readonly provider?: string;
	readonly coverage?: string;
	readonly expiryDate?: string;
	readonly assetIds?: readonly string[];
	readonly assets?: readonly NotificationAsset[];
	readonly workOrderId?: string;
	readonly workOrderDescription?: string;
}

/**
 * Insurance notification metadata
 * Used when navigating from work order to insurance claim
 */
export interface InsuranceNotificationMetadata {
	readonly insuranceId?: string;
	readonly insuranceName?: string;
	readonly provider?: string;
	readonly policyNumber?: string;
	readonly expiryDate?: string;
	readonly assetIds?: readonly string[];
	readonly assets?: readonly NotificationAsset[];
	readonly remainingCoverage?: number;
	readonly workOrderId?: string;
	readonly workOrderDescription?: string;
}

/**
 * Claim notification metadata
 * Used when navigating from claim to work order
 */
export interface ClaimNotificationMetadata {
	readonly claimId?: string;
	readonly claimNumber?: string;
	readonly claimType?: "Insurance" | "Warranty";
	readonly description?: string;
	readonly assets?: readonly NotificationAsset[];
	readonly amount?: number;
	readonly status?: string;
	readonly referenceName?: string;
	readonly referenceId?: string;
	readonly dateFiled?: string;
	readonly workOrderId?: string | null;
}

/**
 * Navigation state for warranty notifications
 */
export interface WarrantyNotificationNavState {
	readonly openClaimForm: true;
	readonly warrantyId?: string;
	readonly warrantyData?: Record<string, unknown>;
	readonly notificationId?: string;
}

/**
 * Navigation state for insurance notifications
 */
export interface InsuranceNotificationNavState {
	readonly openClaimForm: true;
	readonly insuranceId?: string;
	readonly insuranceData?: Record<string, unknown>;
	readonly notificationId?: string;
}

/**
 * Navigation state for claim notifications
 */
export interface ClaimNotificationNavState {
	readonly openWorkOrderForm: true;
	readonly claimId?: string;
	readonly claimData?: Record<string, unknown>;
	readonly notificationId?: string;
}

/**
 * Union type for all notification navigation states
 */
export type NotificationNavState =
	| WarrantyNotificationNavState
	| InsuranceNotificationNavState
	| ClaimNotificationNavState;

