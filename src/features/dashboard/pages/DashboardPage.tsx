import React, { useMemo, useState } from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { DndContext, DragOverlay, closestCenter, useDroppable, useDraggable, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragStartEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DashboardCard } from "../components/DashboardCard";
import {
  useDashboardWidgets,
  type WidgetDefinition,
  type PieSegment,
  type DashboardWidgetDetails,
  type WorkOrder,
} from "../hooks/useDashboardWidgets";
import TabHeader from "@/components/TabHeader";
import { RecentActivityTable } from "../components/RecentActivityTable";
import { cn } from "@/utils/utils";

const WidgetPaletteCard: React.FC<{
  widget: WidgetDefinition;
  onAdd: (id: WidgetDefinition["id"]) => void;
}> = ({ widget, onAdd }) => {
  const { setNodeRef, listeners, attributes, transform, isDragging } = useDraggable({
    id: `palette-${widget.id}`,
    data: { origin: "available", widgetId: widget.id },
  });

  const style = {
    touchAction: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    transform: CSS.Transform.toString(transform),
    width: '220px', // Ensure consistent width
    transition: 'box-shadow 200ms ease',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "relative rounded-lg border border-dashed border-outlineVariant bg-surfaceContainer p-3 shadow-sm transition hover:border-primary hover:bg-surface",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-semibold text-onSurface">{widget.title}</h3>
          <p className="mt-1 text-xs text-onSurfaceVariant line-clamp-2">{widget.description}</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(widget.id);
          }}
          className="rounded-md border border-primary px-2 py-1 text-xs font-medium text-primary transition hover:bg-primary hover:text-white flex-shrink-0"
        >
          Add
        </button>
      </div>
    </div>
  );
};

const PieChart: React.FC<{ data: PieSegment[]; total: number; label?: string }> = ({ data, total, label }) => {
  const gradient = useMemo(() => {
    if (!data.length || total === 0) {
      return "conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)";
    }

    let offset = 0;
    const segments = data
      .filter((segment) => segment.value > 0)
      .map((segment) => {
        const percentage = segment.value / data.reduce((sum, entry) => sum + entry.value, 0);
        const start = offset * 360;
        offset += percentage;
        const end = offset * 360;
        return `${segment.color} ${start}deg ${end}deg`;
      });

    return segments.length ? `conic-gradient(${segments.join(", ")})` : "conic-gradient(#e5e7eb 0deg, #e5e7eb 360deg)";
  }, [data, total]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-48 w-48">
        <div className="h-48 w-48 rounded-full shadow-inner" style={{ background: gradient }} />
        <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white shadow">
          <span className="text-xl font-semibold text-onSurface">{total.toLocaleString()}</span>
          <span className="text-xs uppercase tracking-wide text-onSurfaceVariant">{label ?? "Total"}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm text-onSurface">
        {data.map((segment) => (
          <li key={segment.label} className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="font-medium">{segment.label}</span>
            <span className="text-onSurfaceVariant">
              {segment.value.toLocaleString()} ({total ? Math.round((segment.value / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const AssetOverviewSection: React.FC<{
  details: NonNullable<DashboardWidgetDetails["total-assets"]>;
}> = ({ details }) => (
  <section className="space-y-6 rounded-xl border border-outline bg-surface p-6 shadow-sm">
    <header className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-onSurface">Asset Insights</h2>
      <p className="text-sm text-onSurfaceVariant">
        Distribution, financial exposure, and key performance indicators pulled straight from the asset catalogue.
      </p>
    </header>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <PieChart data={details.pieSegments} total={details.headlineValue} label="Assets" />
      <div className="grid gap-4 md:grid-cols-2">
        {details.summaryTiles.map((tile) => (
          <div key={tile.label} className="rounded-lg border border-outlineVariant bg-surfaceContainer p-4 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-onSurfaceVariant">{tile.label}</div>
            <div className="mt-2 text-2xl font-semibold text-onSurface">{tile.value}</div>
            {tile.description ? <p className="mt-1 text-xs text-onSurfaceVariant">{tile.description}</p> : null}
          </div>
        ))}
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-lg border border-outlineVariant bg-surfaceContainer p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-onSurface">Asset Breakdown by Group</h3>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-onSurfaceVariant">
              <th className="pb-2">Group</th>
              <th className="pb-2">Assets</th>
              <th className="pb-2 text-right">Total Cost (RM)</th>
            </tr>
          </thead>
          <tbody>
            {details.groupBreakdown.map((group) => (
              <tr key={group.group} className="border-t border-outlineVariant/40">
                <td className="py-2">{group.group}</td>
                <td className="py-2">{group.totalAssets.toLocaleString()}</td>
                <td className="py-2 text-right">{group.totalCost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-outlineVariant bg-surfaceContainer p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-onSurface">Top Assets by Cost</h3>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-onSurfaceVariant">
              <th className="pb-2">Asset</th>
              <th className="pb-2">Group</th>
              <th className="pb-2 text-right">Cost (RM)</th>
            </tr>
          </thead>
          <tbody>
            {details.topAssets.map((asset) => (
              <tr key={asset.id} className="border-t border-outlineVariant/40">
                <td className="py-2 font-medium">{asset.name}</td>
                <td className="py-2 text-onSurfaceVariant">{asset.group}</td>
                <td className="py-2 text-right">{asset.cost.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <RecentActivityTable
      title="Recent Maintenance & Asset Activity"
      activities={details.activity}
      columns={["type", "title", "status", "date"]}
      emptyMessage="No recent maintenance records."
    />
  </section>
);

const WorkRequestSection: React.FC<{
  details: NonNullable<DashboardWidgetDetails["work-requests"]>;
}> = ({ details }) => (
  <section className="space-y-6 rounded-xl border border-outline bg-surface p-6 shadow-sm">
    <header className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-onSurface">Work Request Pipeline</h2>
      <p className="text-sm text-onSurfaceVariant">
        Track the latest submissions and the approval workload handled by the maintenance team.
      </p>
    </header>

    <div className="grid gap-4 md:grid-cols-4">
      {details.summaryTiles.map((tile) => (
        <div key={tile.label} className="rounded-lg border border-outlineVariant bg-surfaceContainer p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-onSurfaceVariant">{tile.label}</div>
          <div className="mt-2 text-2xl font-semibold text-onSurface">{tile.value}</div>
          {tile.description ? <p className="mt-1 text-xs text-onSurfaceVariant">{tile.description}</p> : null}
        </div>
      ))}
    </div>

    <div className="rounded-lg border border-outlineVariant bg-surfaceContainer p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-onSurface">Latest Requests</h3>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-onSurfaceVariant">
            <th className="pb-2">Request ID</th>
            <th className="pb-2">Requester</th>
            <th className="pb-2">Department</th>
            <th className="pb-2">Type</th>
            <th className="pb-2">Status</th>
            <th className="pb-2 text-right">Date</th>
          </tr>
        </thead>
        <tbody>
          {details.requests.slice(0, 12).map((request) => (
            <tr key={request.id} className="border-t border-outlineVariant/40">
              <td className="py-2 font-medium">{request.requestId}</td>
              <td className="py-2">{request.requesterName}</td>
              <td className="py-2 text-onSurfaceVariant">{request.department}</td>
              <td className="py-2 text-onSurfaceVariant">{request.requestType}</td>
              <td className="py-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {request.status}
                </span>
              </td>
              <td className="py-2 text-right text-onSurfaceVariant">
                {new Date(request.requestDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <RecentActivityTable
      title="Recent Work Request Activity"
      activities={details.activity}
      columns={["title", "description", "status", "date"]}
      emptyMessage="No work request activity recorded."
    />
  </section>
);

const WorkOrderSection: React.FC<{
  details: NonNullable<DashboardWidgetDetails["work-orders"]>;
}> = ({ details }) => (
  <section className="space-y-6 rounded-xl border border-outline bg-surface p-6 shadow-sm">
    <header className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-onSurface">Work Order Overview</h2>
      <p className="text-sm text-onSurfaceVariant">
        A live look at active maintenance jobs, their statuses, and recent activity.
      </p>
    </header>

    <div className="grid gap-4 md:grid-cols-4">
      {details.summaryTiles.map((tile) => (
        <div key={tile.label} className="rounded-lg border border-outlineVariant bg-surfaceContainer p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-onSurfaceVariant">{tile.label}</div>
          <div className="mt-2 text-2xl font-semibold text-onSurface">{tile.value}</div>
          {tile.description ? <p className="mt-1 text-xs text-onSurfaceVariant">{tile.description}</p> : null}
        </div>
      ))}
    </div>

    <div className="rounded-lg border border-outlineVariant bg-surfaceContainer p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-onSurface">Active Work Orders</h3>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-onSurfaceVariant">
            <th className="pb-2">Order ID</th>
            <th className="pb-2">Job Title</th>
            <th className="pb-2">Assigned To</th>
            <th className="pb-2">Status</th>
            <th className="pb-2 text-right">Created Date</th>
          </tr>
        </thead>
        <tbody>
          {details.orders.slice(0, 12).map((order: WorkOrder) => (
            <tr key={order.id} className="border-t border-outlineVariant/40">
              <td className="py-2 font-medium">{order.workOrderId}</td>
              <td className="py-2">{order.jobTitle}</td>
              <td className="py-2 text-onSurfaceVariant">{order.assignedTo || "Unassigned"}</td>
              <td className="py-2">{order.status}</td>
              <td className="py-2 text-right text-onSurfaceVariant">{new Date(order.createdDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

const DashboardPage: React.FC = () => {
  const { availableWidgets, activeWidgets, widgetDetails, handleDragEnd, handleWidgetAdd, handleWidgetRemove } =
    useDashboardWidgets();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };

  const activeWidgetIds = useMemo(() => activeWidgets.map((w) => w.id), [activeWidgets]);
  const draggedWidget = useMemo(() => {
    return activeDragId ? activeWidgets.find((w) => w.id === activeDragId) : null;
  }, [activeDragId, activeWidgets]);

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  // Make Widget Library a droppable zone
  const { setNodeRef: setLibraryRef, isOver: isLibraryOver } = useDroppable({
    id: "widget-library",
  });

  // Make main content area a droppable zone
  const { setNodeRef: setContentRef, isOver: isContentOver } = useDroppable({
    id: "main-content",
  });

  const getHeadlineValue = (id: WidgetDefinition["id"]): number | string => {
    switch (id) {
      case "total-assets":
        return widgetDetails["total-assets"]?.headlineValue ?? 0;
      case "work-requests":
        return widgetDetails["work-requests"]?.headlineValue ?? 0;
      case "work-orders":
        return widgetDetails["work-orders"]?.headlineValue ?? 0;
      default:
        return 0;
    }
  };

  return (
    <AppLayout breadcrumbs={[{ label: "Asset Maintenance" }, { label: "Dashboard" }]}>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="p-4">
          <TabHeader
            title="Asset Management Dashboard"
            subtitle="Drag widgets from the library to add them, or drag them back to remove."
          />

          {/* Widget Library - Droppable zone with improved drag handling */}
          <div className="mt-6 space-y-4 relative z-10">
            <h2 className="text-sm font-semibold text-onSurface">Widget Library</h2>
            <div
              ref={setLibraryRef}
              className={cn(
                "rounded-lg border border-outlineVariant p-4 transition overflow-visible",
                isLibraryOver && "bg-primary/5"
              )}
            >
              {availableWidgets.length === 0 ? (
                <p className="text-xs text-onSurfaceVariant">
                  All available widgets are currently active. Drag a widget card back here to remove it.
                </p>
              ) : (
                <div className="flex flex-row gap-3 overflow-visible">
                  {availableWidgets.map((widget) => (
                    <WidgetPaletteCard key={widget.id} widget={widget} onAdd={handleWidgetAdd} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area - Droppable zone for widgets */}
          <div
            ref={setContentRef}
            className={cn(
              "mt-6 flex flex-col gap-6 min-h-[200px] transition rounded-lg p-4 border-2 border-transparent",
              isContentOver && "bg-primary/5 border-2 border-dashed border-primary"
            )}
          >
            {/* Widget Row - Cards displayed horizontally */}
            {activeWidgets.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-sm text-onSurfaceVariant">
                <p>
                  No widgets added yet. Drag widgets from the Widget Library above to get started.
                </p>
              </div>
            ) : (
              <SortableContext items={activeWidgetIds} strategy={horizontalListSortingStrategy}>
                <div className="flex flex-row gap-3 overflow-x-auto pb-2">
                  {activeWidgets.map((widget) => (
                    <div key={widget.id} className="flex-shrink-0">
                      <DashboardCard
                        id={widget.id}
                        title={widget.title}
                        value={getHeadlineValue(widget.id)}
                        description={widget.description}
                        removable
                        onRemove={handleWidgetRemove}
                      />
                    </div>
                  ))}
                </div>
              </SortableContext>
            )}

            {/* Detailed Sections */}
            {activeWidgets.map((widget) => {
              if (widget.id === "total-assets" && widgetDetails["total-assets"]) {
                return <AssetOverviewSection key={widget.id} details={widgetDetails["total-assets"]} />;
              }
              if (widget.id === "work-requests" && widgetDetails["work-requests"]) {
                return <WorkRequestSection key={widget.id} details={widgetDetails["work-requests"]} />;
              }
              if (widget.id === "work-orders" && widgetDetails["work-orders"]) {
                return <WorkOrderSection key={widget.id} details={widgetDetails["work-orders"]} />;
              }
              return null;
            })}
          </div>
        </div>
        <DragOverlay>
          {activeDragId?.startsWith("palette-") ? (
            (() => {
              const widgetId = activeDragId.replace("palette-", "");
              const widget = availableWidgets.find(w => w.id === widgetId);
              if (!widget) return null;
              return (
                <div className="rounded-lg border border-dashed border-primary bg-surface p-3 shadow-xl opacity-90 w-[220px]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xs font-semibold text-onSurface">{widget.title}</h3>
                      <p className="mt-1 text-xs text-onSurfaceVariant line-clamp-2">{widget.description}</p>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : draggedWidget ? (
            <DashboardCard
              id={draggedWidget.id}
              title={draggedWidget.title}
              value={getHeadlineValue(draggedWidget.id)}
              description={draggedWidget.description}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </AppLayout>
  );
};

export default DashboardPage;
