import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import type { DowntimeIncident } from "@/features/downtime/types";
import Search from "@/components/Search";
import { formatDate, formatTime } from "@/features/downtime/services/downtimeService";
import { getPriorityVariant } from "@/features/downtime/constants";

interface DowntimeTableProps {
  incidents: DowntimeIncident[];
  onEditIncident: (incident: DowntimeIncident) => void;
}

export const DowntimeTable: React.FC<DowntimeTableProps> = ({
  incidents,
  onEditIncident,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredIncidents = useMemo(() => {
    if (!searchQuery.trim()) return incidents;
    
    const query = searchQuery.toLowerCase();
    return incidents.filter((incident) => {
      const assetTokens = incident.assets
        .map((asset) => `${asset.name} ${asset.id}`.toLowerCase())
        .join(" ");

      return (
        assetTokens.includes(query) ||
        incident.description.toLowerCase().includes(query)
      );
    });
  }, [incidents, searchQuery]);

  const columns: ColumnDef<DowntimeIncident>[] = useMemo(
    () => [
      {
        accessorKey: "assets",
        header: "Assets",
        cell: ({ row }) => (
          <div className="max-w-xl">
            {row.original.assets.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2">
                {row.original.assets.map((asset) => (
                  <div
                    key={asset.id}
                    className="rounded-lg border border-outlineVariant/40 bg-surfaceContainerHighest px-3 py-2 shadow-sm transition hover:border-primary/60"
                    title={`${asset.name} (${asset.id})${asset.location ? ` · ${asset.location}` : ""}`}
                  >
                    <div className="text-sm font-medium text-onSurface truncate" title={asset.name}>
                      {asset.name} <span className="text-xs text-onSurfaceVariant">({asset.id})</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-onSurfaceVariant">—</div>
            )}
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => {
          const priority = getValue() as DowntimeIncident["priority"];
          const variant = getPriorityVariant(priority);

          return <Badge text={priority} variant={variant} className="h-6 px-3" />;
        },
        filterFn: "multiSelect",
        enableColumnFilter: true,
        enableSorting: true,
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
          <Search searchValue={searchQuery} onSearch={setSearchQuery} searchPlaceholder="Search incidents..." live={true} />
        </div>
      </div>
      
      <DataTableExtended columns={columns} data={filteredIncidents} showPagination={true} onRowDoubleClick={onEditIncident} />
    </div>
  );
};
