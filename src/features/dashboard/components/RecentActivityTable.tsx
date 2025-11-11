import React from "react";
import type { RecentActivity } from "../hooks/useDashboardWidgets";
import { Badge } from "@/components/ui/components";
import { Wrench, FileText, AlertTriangle, Shield, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/utils/utils";

type ColumnKey = "type" | "title" | "description" | "status" | "date";

interface RecentActivityTableProps {
  activities: RecentActivity[];
  title?: string;
  emptyMessage?: string;
  columns?: ColumnKey[];
}

const typeIcons = {
  "work-order": Wrench,
  "work-request": FileText,
  downtime: AlertTriangle,
  warranty: Shield,
  asset: Package,
};

const typeColours = {
  "work-order": "text-blue-600",
  "work-request": "text-purple-600",
  downtime: "text-red-600",
  warranty: "text-green-600",
  asset: "text-slate-600",
};

const columnLabels: Record<ColumnKey, string> = {
  type: "Type",
  title: "Title",
  description: "Description",
  status: "Status",
  date: "Date",
};

export const RecentActivityTable: React.FC<RecentActivityTableProps> = ({
  activities,
  title,
  emptyMessage = "No activity recorded.",
  columns,
}) => {
  const resolvedColumns: ColumnKey[] = columns?.length ? columns : ["type", "title", "description", "status", "date"];

  if (!activities.length) {
    return (
      <div className="rounded-lg border border-outlineVariant bg-surfaceContainer p-6 text-center text-sm text-onSurfaceVariant">
        {title ? <p className="mb-2 font-semibold text-onSurface">{title}</p> : null}
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-outlineVariant bg-surfaceContainer shadow-sm">
      {title ? <div className="border-b border-outlineVariant p-4 text-sm font-semibold text-onSurface">{title}</div> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surfaceVariant/40 text-xs uppercase text-onSurfaceVariant">
            <tr>
              {resolvedColumns.map((column) => (
                <th key={column} className="px-6 py-3 text-left">
                  {columnLabels[column]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outlineVariant/40 bg-white">
            {activities.map((activity) => {
              const Icon = typeIcons[activity.type];
              return (
                <tr key={activity.id} className="hover:bg-surfaceVariant/20">
                  {resolvedColumns.includes("type") ? (
                    <td className="px-6 py-4">
                      {Icon ? <Icon className={cn("h-5 w-5", typeColours[activity.type])} /> : null}
                    </td>
                  ) : null}
                  {resolvedColumns.includes("title") ? (
                    <td className="px-6 py-4 font-medium text-onSurface">{activity.title}</td>
                  ) : null}
                  {resolvedColumns.includes("description") ? (
                    <td className="px-6 py-4 text-onSurfaceVariant">{activity.description}</td>
                  ) : null}
                  {resolvedColumns.includes("status") ? (
                    <td className="px-6 py-4">
                      {activity.status ? (
                        <Badge variant={activity.status === "Completed" ? "success" : "default"}>
                          {activity.status}
                        </Badge>
                      ) : (
                        <span className="text-onSurfaceVariant">—</span>
                      )}
                    </td>
                  ) : null}
                  {resolvedColumns.includes("date") ? (
                    <td className="px-6 py-4 text-onSurfaceVariant">
                      {format(new Date(activity.date), "MMM dd, yyyy HH:mm")}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};