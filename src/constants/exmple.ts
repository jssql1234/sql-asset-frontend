export enum StatusCode {
  UNPAID = 0,
  IN_PROCESS = 1,
  NEW_ORDER = 2,
  TO_SHIP = 3,
  SHIPPED = 4,
  CANCELLED = 5,
  RETURNED = 6,
  DELIVERED = 7,
  COMPLETED = 8,
  UNKNOWN = -1,
}

type StatusVariant = "green" | "red" | "yellow";

export interface StatusConfig {
  key: string;
  variant: StatusVariant;
}

export const STATUS_MAP: Record<StatusCode, StatusConfig> = {
  [StatusCode.UNPAID]: { key: "status.unpaid", variant: "yellow" },
  [StatusCode.NEW_ORDER]: { key: "status.newOrder", variant: "yellow" },
  [StatusCode.IN_PROCESS]: { key: "status.inProcess", variant: "yellow" },
  [StatusCode.TO_SHIP]: { key: "status.toShip", variant: "yellow" },
  [StatusCode.SHIPPED]: { key: "status.shipped", variant: "yellow" },
  [StatusCode.CANCELLED]: { key: "status.cancelled", variant: "red" },
  [StatusCode.RETURNED]: { key: "status.returned", variant: "red" },
  [StatusCode.DELIVERED]: { key: "status.delivered", variant: "green" },
  [StatusCode.COMPLETED]: { key: "status.completed", variant: "green" },
  [StatusCode.UNKNOWN]: { key: "status.unknown", variant: "red" },
};
