import { useState, useMemo, useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import { useGetAsset } from "@/features/asset/hooks/useAssetService";
import { workOrderService, workRequestService } from "@/features/work-request/services/workRequestService";
import { useGetDowntimeIncidents } from "@/features/downtime/hooks/useDowntimeService";
import type { WorkRequest } from "@/types/work-request";
import type { Asset } from "@/types/asset";
import type { WorkOrder } from "@/types/work-order";

export type WidgetKind = "total-assets" | "work-requests" | "work-orders";

export interface WidgetDefinition {
  id: WidgetKind;
  title: string;
  description: string;
  group: "assets" | "operations";
}

export interface PieSegment {
  label: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: "work-order" | "work-request" | "downtime" | "warranty" | "asset";
  title: string;
  description: string;
  date: string;
  status?: string;
}

interface SummaryTile {
  label: string;
  value: string;
  description?: string;
}

interface AssetGroupBreakdown {
  group: string;
  totalAssets: number;
  totalCost: number;
}

interface TopAsset {
  id: string;
  name: string;
  group: string;
  cost: number;
}

export interface AssetWidgetDetails {
  headlineValue: number;
  summaryTiles: SummaryTile[];
  pieSegments: PieSegment[];
  groupBreakdown: AssetGroupBreakdown[];
  topAssets: TopAsset[];
  activity: RecentActivity[];
  totalCost: number;
}

export interface WorkRequestWidgetDetails {
  headlineValue: number;
  summaryTiles: SummaryTile[];
  requests: WorkRequest[];
  activity: RecentActivity[];
}

export interface WorkOrderWidgetDetails {
  headlineValue: number;
  summaryTiles: SummaryTile[];
  orders: WorkOrder[];
  activity: RecentActivity[];
}

export type DashboardWidgetDetails = {
  "total-assets"?: AssetWidgetDetails;
  "work-requests"?: WorkRequestWidgetDetails;
  "work-orders"?: WorkOrderWidgetDetails;
};

const WIDGET_LIBRARY: WidgetDefinition[] = [
  {
    id: "total-assets",
    title: "Total Assets",
    description: "Drag to reveal asset KPIs, status mix, and top performers.",
    group: "assets",
  },
  {
    id: "work-requests",
    title: "Work Requests",
    description: "Drag to see request pipeline health and recent submissions.",
    group: "operations",
  },
  {
    id: "work-orders",
    title: "Active Work Orders",
    description: "Monitor ongoing maintenance tasks, assignments, and statuses.",
    group: "operations",
  },
];

const assetStatusColours: Record<string, string> = {
  "In Use": "#10B981",
  Maintenance: "#F59E0B",
  Down: "#EF4444",
  Idle: "#6366F1",
};

const buildRecentActivityFromWorkOrders = (assetsInvolved: AssetWidgetDetails["activity"], workOrders = workOrderService.getWorkOrders()): RecentActivity[] => {
  return workOrders
    .slice()
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 8)
    .map((order) => ({
      id: order.id,
      type: "work-order",
      title: order.jobTitle || order.workOrderId,
      description: `${order.workType} • ${order.assignedTo || "Unassigned"}`,
      date: order.createdDate,
      status: order.status,
    }));
};

const buildRecentActivityFromRequests = (workRequests: WorkRequest[]): RecentActivity[] =>
  workRequests.slice(0, 10).map((request) => ({
    id: request.id,
    type: "work-request",
    title: request.requestId,
    description: `${request.requestType} • ${request.department}`,
    date: request.requestDate,
    status: request.status,
  }));

export const useDashboardWidgets = () => {
  const { data: assets = [] } = useGetAsset();
  const { data: downtimeIncidents = [] } = useGetDowntimeIncidents();

  const workOrders = useMemo(() => workOrderService.getWorkOrders(), []);
  const workRequests = useMemo(() => workRequestService.getWorkRequests(), []);

  const [activeWidgetIds, setActiveWidgetIds] = useState<WidgetKind[]>([]);

  const handleWidgetAdd = useCallback((id: WidgetKind) => {
    setActiveWidgetIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleWidgetRemove = useCallback((id: WidgetKind) => {
    setActiveWidgetIds((prev) => prev.filter((widgetId) => widgetId !== id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const origin = active.data.current?.origin as "available" | "active" | undefined;
      const widgetId = active.data.current?.widgetId as WidgetKind | undefined;

      if (!widgetId) return;

      const overId = String(over.id);

      if (origin === "available") {
        // Dragging from Widget Library
        // If dropped outside library (in main content area), add widget
        if (overId === "main-content" || (!overId.includes("widget-library") && !overId.includes("palette-"))) {
          setActiveWidgetIds((prev) => {
            if (prev.includes(widgetId)) return prev;
            return [...prev, widgetId];
          });
        }
        return;
      }

      if (origin === "active") {
        // Dragging an active widget card
        // If dropped into Widget Library, remove widget
        if (overId === "widget-library" || overId.includes("widget-library")) {
          setActiveWidgetIds((prev) => prev.filter((id) => id !== widgetId));
          return;
        }

        // Otherwise, allow reordering within active widgets
        const overWidgetId = (over.data?.current?.widgetId ?? over.id) as WidgetKind | undefined;
        if (!overWidgetId || widgetId === overWidgetId) return;

        setActiveWidgetIds((prev) => {
          const oldIndex = prev.indexOf(widgetId);
          const newIndex = prev.indexOf(overWidgetId);
          if (oldIndex === -1 || newIndex === -1) {
            return prev;
          }
          return arrayMove(prev, oldIndex, newIndex);
        });
      }
    },
    []
  );

  const availableWidgets = useMemo(
    () => WIDGET_LIBRARY.filter((widget) => !activeWidgetIds.includes(widget.id)),
    [activeWidgetIds]
  );

  const activeWidgets = useMemo(
    () => activeWidgetIds.map((id) => WIDGET_LIBRARY.find((widget) => widget.id === id)).filter(Boolean) as WidgetDefinition[],
    [activeWidgetIds]
  );

  const assetWidgetDetails = useMemo<AssetWidgetDetails | undefined>(() => {
    const totalAssets = assets.length;
    const activeAssets = assets.filter((asset) => asset.active).length;
    const maintenanceAssets = workOrders.filter((order) => order.status === "In Progress").length;
    const downAssets = downtimeIncidents.length;
    const idleAssets = Math.max(totalAssets - activeAssets - maintenanceAssets - downAssets, 0);

    const totalAssetCost = assets.reduce((sum, asset) => sum + asset.cost, 0);
    const pendingRequests = workRequests.filter((request) => request.status === "Pending").length;

    const pieSegments: PieSegment[] = [
      { label: "In Use", value: activeAssets, color: assetStatusColours["In Use"] },
      { label: "Maintenance", value: maintenanceAssets, color: assetStatusColours["Maintenance"] },
      { label: "Down", value: downAssets, color: assetStatusColours["Down"] },
      { label: "Idle", value: idleAssets, color: assetStatusColours["Idle"] },
    ].filter((segment) => segment.value > 0);

    const summaryTiles: SummaryTile[] = [
      { label: "Total Assets", value: totalAssets.toLocaleString(), description: "Registered items" },
      { label: "Total Asset Cost", value: `RM ${totalAssetCost.toLocaleString()}`, description: "Book value" },
      { label: "Pending Work Requests", value: pendingRequests.toLocaleString(), description: "Awaiting review" },
      { label: "Active Work Orders", value: maintenanceAssets.toLocaleString(), description: "In progress" },
    ];

    const groupLookup = new Map<string, { totalAssets: number; totalCost: number }>();
    assets.forEach((asset) => {
      const current = groupLookup.get(asset.group) ?? { totalAssets: 0, totalCost: 0 };
      current.totalAssets += 1;
      current.totalCost += asset.cost;
      groupLookup.set(asset.group, current);
    });

    const groupBreakdown: AssetGroupBreakdown[] = Array.from(groupLookup.entries()).map(([group, snapshot]) => ({
      group,
      totalAssets: snapshot.totalAssets,
      totalCost: snapshot.totalCost,
    }));

    const topAssets: TopAsset[] = [...assets]
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 5)
      .map((asset) => ({
        id: asset.id,
        name: asset.name,
        group: asset.group,
        cost: asset.cost,
      }));

    const activity = buildRecentActivityFromWorkOrders([], workOrders);

    return {
      headlineValue: totalAssets,
      summaryTiles,
      pieSegments,
      groupBreakdown,
      topAssets,
      activity,
      totalCost: totalAssetCost,
    };
  }, [assets, workOrders, downtimeIncidents, workRequests]);

  const workRequestDetails = useMemo<WorkRequestWidgetDetails | undefined>(() => {
    if (!workRequests.length) {
      return {
        headlineValue: 0,
        summaryTiles: [
          { label: "Pending", value: "0", description: "Awaiting approval" },
          { label: "Approved", value: "0", description: "Ready to schedule" },
          { label: "Rejected", value: "0", description: "Closed out" },
        ],
        requests: [],
        activity: [],
      };
    }

    const pending = workRequests.filter((request) => request.status === "Pending").length;
    const approved = workRequests.filter((request) => request.status === "Approved").length;
    const rejected = workRequests.filter((request) => request.status === "Rejected").length;

    const summaryTiles: SummaryTile[] = [
      { label: "Total Requests", value: workRequests.length.toLocaleString(), description: "Recorded submissions" },
      { label: "Pending", value: pending.toLocaleString(), description: "Awaiting approval" },
      { label: "Approved", value: approved.toLocaleString(), description: "Ready for scheduling" },
      { label: "Rejected", value: rejected.toLocaleString(), description: "Closed without action" },
    ];

    const sortedRequests = workRequests
      .slice()
      .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

    const activity = buildRecentActivityFromRequests(sortedRequests);

    return {
      headlineValue: workRequests.length,
      summaryTiles,
      requests: sortedRequests,
      activity,
    };
  }, [workRequests]);

  const workOrderDetails = useMemo<WorkOrderWidgetDetails | undefined>(() => {
    const inProgress = workOrders.filter((order) => order.status === "In Progress").length;
    const onHold = workOrders.filter((order) => order.status === "On Hold").length;
    const completedToday = workOrders.filter(
      (order) =>
        order.status === "Completed" &&
        new Date(order.completedDate || 0).toDateString() === new Date().toDateString()
    ).length;

    const summaryTiles: SummaryTile[] = [
      { label: "Total Active", value: workOrders.length.toLocaleString(), description: "All non-closed orders" },
      { label: "In Progress", value: inProgress.toLocaleString(), description: "Currently being worked on" },
      { label: "On Hold", value: onHold.toLocaleString(), description: "Awaiting parts or resources" },
      { label: "Completed Today", value: completedToday.toLocaleString(), description: "Finished since midnight" },
    ];

    const sortedOrders = workOrders
      .slice()
      .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());

    const activity = buildRecentActivityFromWorkOrders([], sortedOrders);

    return {
      headlineValue: workOrders.length,
      summaryTiles,
      orders: sortedOrders,
      activity,
    };
  }, [workOrders]);

  const widgetDetails: DashboardWidgetDetails = useMemo(
    () => ({
      "total-assets": assetWidgetDetails,
      "work-requests": workRequestDetails,
      "work-orders": workOrderDetails,
    }),
    [assetWidgetDetails, workRequestDetails, workOrderDetails]
  );

  return {
    availableWidgets,
    activeWidgets,
    widgetDetails,
    handleWidgetAdd,
    handleWidgetRemove,
    handleDragEnd,
  };
};