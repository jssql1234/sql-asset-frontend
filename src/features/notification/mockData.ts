import type { Notification } from "./types";

const subtractHours = (hours: number) => {
  const date = new Date();
  date.setHours(date.getHours() - hours);
  return date.toISOString();
};

const subtractDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
};

export const createMockNotifications = (): Notification[] => [
  {
    id: "notif-1",
    type: "work_order",
    status: "unread",
    title: "Work Order WO-001 Assigned",
    message: "You have been assigned to repair Excavator EXC-001.",
    sourceModule: "work-order",
    sourceId: "WO-001",
    actionUrl: "/work-orders",
    actionLabel: "Open work order",
    createdAt: subtractHours(2),
    createdBy: "System",
  },
  {
    id: "notif-2",
    type: "meter_reading",
    status: "unread",
    title: "Meter Reading Threshold Reached",
    message: "Engine hours for Bulldozer BD-002 exceeded 5,000 hours.",
    sourceModule: "meter",
    sourceId: "BD-002",
    actionUrl: "/meter-reading",
    actionLabel: "Review meter",
    metadata: { currentReading: 5050, threshold: 5000 },
    createdAt: subtractHours(6),
  },
  {
    id: "notif-3",
    type: "maintenance",
    status: "read",
    title: "Scheduled Maintenance Due",
    message: "Preventive maintenance for Generator GEN-003 is due in 3 days.",
    sourceModule: "maintain",
    sourceId: "PM-2025-089",
    actionUrl: "/maintain",
    actionLabel: "Schedule maintenance",
    createdAt: subtractDays(1),
    readAt: subtractHours(12),
  },
  {
    id: "notif-4",
    type: "asset_alert",
    status: "unread",
    title: "Asset Downtime Alert",
    message: "Forklift FK-005 has been offline for 48 hours.",
    sourceModule: "downtime",
    sourceId: "FK-005",
    actionUrl: "/downtime-tracking",
    actionLabel: "Investigate downtime",
    createdAt: subtractDays(2),
  },
  {
    id: "notif-5",
    type: "approval",
    status: "read",
    title: "Work Request WR-2025-015 Approved",
    message: "The work request has been converted into a work order.",
    sourceModule: "work-request",
    sourceId: "WR-2025-015",
    actionUrl: "/work-request",
    actionLabel: "View request",
    createdAt: subtractDays(5),
    readAt: subtractDays(4),
  },
];
