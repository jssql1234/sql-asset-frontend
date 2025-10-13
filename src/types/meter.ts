import type { Asset } from "./asset";

export type BoundaryTrigger = "none" | "lower" | "upper" | "both";

export interface MeterCondition {
	id: string;
	conditionTarget: string;
	operator: string;
	value: string | number;
	triggerAction: string;
	triggerMode: string;
}

export interface Meter {
	id: string;
	name: string;
	unit: string;
	type: "numeric" | "counter" | "boolean" | "text";
	lowerBoundary?: number;
	upperBoundary?: number;
	notesPlaceholder?: string;
	conditions?: MeterCondition[];
}

export interface MeterGroup {
	id: string;
	name: string;
	description?: string;
	boundaryTrigger: BoundaryTrigger;
	meters: Meter[];
	assignedAssets: Asset[];
	createdAt: string;
	updatedAt?: string;
}

export interface MeterReading {
	id: string;
	groupId: string;
	meterId: string;
	assetId: string;
	assetCode: string;
	assetName: string;
	recordedBy: string;
	recordedAt: string;
	value: number;
	notes?: string;
	unit: string;
	boundaryViolation?: "lower" | "upper";
	meterDeleted?: boolean;
}

export interface MeterState {
	meterGroups: MeterGroup[];
	availableAssets: Asset[];
	readings: MeterReading[];
	activeUser: string;
}

export interface MeterGroupInput {
	name: string;
	description?: string;
	boundaryTrigger: BoundaryTrigger;
}

export interface MeterInput {
	name: string;
	unit: string;
	type: "numeric" | "counter" | "boolean" | "text";
	lowerBoundary?: number;
	upperBoundary?: number;
	conditions?: MeterCondition[];
}

export interface MeterReadingDraft {
	meterId: string;
	value: number;
	notes?: string;
}

export interface MeterAssignmentPayload {
	groupId: string;
	assetIds: string[];
}

export type MeterAssignmentStrategy = "move" | "share";
