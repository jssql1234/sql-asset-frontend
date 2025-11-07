export type NotificationPriority = "low" | "medium" | "high" | "urgent";

export type NotificationStatus = "unread" | "read" | "archived";

export type NotificationType =
	| "work_order"
	| "work_request"
	| "maintenance"
	| "meter_reading"
	| "asset_alert"
	| "system"
	| "approval"
	| "reminder";

export interface Notification {
	id: string;
	type: NotificationType;
	priority: NotificationPriority;
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
	priority?: NotificationPriority | "";
	status?: NotificationStatus | "";
	dateFrom?: string;
	dateTo?: string;
}

export interface CreateNotificationData {
	type: NotificationType;
	priority: NotificationPriority;
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
