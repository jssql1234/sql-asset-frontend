import type { Asset } from "./asset";

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
	uom: string;
	conditions?: MeterCondition[];
}

export interface MeterGroup {
	id: string;
	name: string;
	description?: string;
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
	uom: string;
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
