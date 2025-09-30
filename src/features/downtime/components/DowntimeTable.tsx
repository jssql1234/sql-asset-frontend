import React, { useMemo } from "react";
import { Badge } from "@/components/ui/components";
import { DataTable } from "@/components/ui/components/Table";
import { type ColumnDef } from "@tanstack/react-table";
import type { DowntimeIncident, FilterState } from "@/features/downtime/types";

export const PRIORITY_BADGE_VARIANT: Record<DowntimeIncident["priority"], "primary" | "red" | "green" | "yellow" | "blue" | "grey"> = {
  Low: "blue",
  Medium: "yellow",
  High: "red",
  Critical: "red",
};

interface DowntimeTableProps {
  incidents: DowntimeIncident[];
  filters: FilterState;
  onEditIncident: (incident: DowntimeIncident) => void;
}

export const DowntimeTable: React.FC<DowntimeTableProps> = ({
  incidents,
  filters,
  onEditIncident,
}) => {
  // Filter incidents based on current filters
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = 
        incident.assetName.toLowerCase().includes(filters.search.toLowerCase()) ||
        incident.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesAsset = !filters.asset || incident.assetId === filters.asset;
      const matchesStatus = !filters.status || incident.status === filters.status;
      const matchesPriority = !filters.priority || incident.priority === filters.priority;
      
      return matchesSearch && matchesAsset && matchesStatus && matchesPriority;
    });
  }, [incidents, filters]);

  // Table column definitions
  const columns: ColumnDef<DowntimeIncident>[] = useMemo(
    () => [
      {
        accessorKey: "assetName",
        header: "Asset",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.assetName}</div>
            <div className="text-sm text-onSurfaceVariant">{row.original.assetId}</div>
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => {
          const priority = getValue() as DowntimeIncident["priority"];
          const variant = PRIORITY_BADGE_VARIANT[priority] ?? "grey";

          return <Badge text={priority} variant={variant} className="h-6 px-3" />;
        },
        filterFn: "multiSelect",
        enableColumnFilter: true,
        meta: {
          filterOptions: [
            { label: "Low", value: "Low" },
            { label: "Medium", value: "Medium" },
            { label: "High", value: "High" },
            { label: "Critical", value: "Critical" },
          ],
        },
      },
      {
        accessorKey: "startTime",
        header: "Start Time",
        cell: ({ getValue }) => {
          const date = new Date(getValue() as string);
          return (
            <div>
              <div>{date.toLocaleDateString()}</div>
              <div className="text-sm text-onSurfaceVariant">{date.toLocaleTimeString()}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => {
          const description = getValue() as string;
          return (
            <div className="max-w-xs">
              <div className="truncate" title={description}>
                {description}
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="title-medium font-medium text-onSurface">
          Current Incidents ({filteredIncidents.length})
        </h2>
      </div>
      
      <DataTable
        columns={columns}
        data={filteredIncidents}
        showPagination={true}
        className="border border-outline"
        onRowDoubleClick={onEditIncident}
      />
    </div>
  );
};