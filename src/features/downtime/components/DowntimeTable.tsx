import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import type { DowntimeIncident } from "@/features/downtime/types";
import Search from "@/components/Search";
import { formatDate, formatTime } from "@/features/downtime/utils/downtimeUtils";
import { PRIORITY_BADGE_VARIANT } from "@/features/downtime/constants";

interface DowntimeTableProps {
  incidents: DowntimeIncident[];
  onEditIncident: (incident: DowntimeIncident) => void;
}

export const DowntimeTable: React.FC<DowntimeTableProps> = ({
  incidents,
  onEditIncident,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter incidents based on search query
  const filteredIncidents = useMemo(() => {
    if (!searchQuery.trim()) return incidents;
    
    const query = searchQuery.toLowerCase();
    return incidents.filter((incident) => 
      incident.assetName.toLowerCase().includes(query) ||
      incident.assetId.toLowerCase().includes(query) ||
      incident.description.toLowerCase().includes(query)
    );
  }, [incidents, searchQuery]);

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
        enableSorting: true,
        enableColumnFilter: false,
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
        enableSorting: false,
      },
      {
        accessorKey: "startTime",
        header: "Start Time",
        cell: ({ getValue }) => {
          const value = getValue() as string;
          return (
            <div>
              <div>{formatDate(value)}</div>
              <div className="text-sm text-onSurfaceVariant">{formatTime(value)}</div>
            </div>
          );
        },
        enableSorting: true,
        enableColumnFilter: false,
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
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    []
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="title-medium font-medium text-onSurface">
          Current Incidents ({filteredIncidents.length})
        </h2>
        <div className="flex-shrink-0 w-80">
          <Search
            searchValue={searchQuery}
            onSearch={setSearchQuery}
            searchPlaceholder="Search incidents..."
            live={true}
          />
        </div>
      </div>
      
      <DataTableExtended
        columns={columns}
        data={filteredIncidents}
        showPagination={true}
        onRowDoubleClick={onEditIncident}
      />
    </div>
  );
};
