import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gauge,
  Info,
  Shield,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { Notification, NotificationFilters } from "./types";

export const NOTIFICATION_TYPE_ICONS: Record<Notification["type"], LucideIcon> = {
  work_order: Wrench,
  work_request: FileText,
  maintenance: Wrench,
  meter_reading: Gauge,
  asset_alert: AlertTriangle,
  system: Info,
  approval: CheckCircle2,
  reminder: Bell,
  warranty: Shield,
  insurance: ShieldCheck,
  claim: ClipboardList,
};

export const MAX_RECENT_NOTIFICATIONS = 10;

export const UNREAD_ONLY_FILTER: Readonly<NotificationFilters> = Object.freeze({
  status: "unread",
});

/**
 * Default notification IDs for fallback when no explicit ID is provided
 */
export const DEFAULT_NOTIFICATION_IDS = Object.freeze({
  WARRANTY_CLAIM: "__warranty-claim__",
  INSURANCE_CLAIM: "__insurance-claim__",
  WORK_ORDER_CLAIM: "__work-order-claim__",
} as const);

