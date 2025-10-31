import React, { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/components";
import { DataTableExtended, type RowAction } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import type { DowntimeIncident } from "@/features/downtime/types";
import Search from "@/components/Search";
import { formatDate, formatTime } from "@/features/downtime/services/downtimeService";
import { getPriorityVariant } from "@/features/downtime/constants";
import TableColumnVisibility from "@/components/ui/components/Table/TableColumnVisibility";

interface DowntimeTableProps {
  incidents: DowntimeIncident[];
  onEditIncident: (incident: DowntimeIncident) => void;
  onDeleteIncident?: (incident: DowntimeIncident) => void;
  onVisibleColumnsChange?: (columns: ColumnDef<DowntimeIncident>[]) => void;
}

export const DowntimeTable: React.FC<DowntimeTableProps> = ({
  incidents,
  onEditIncident,
  onDeleteIncident,
  onVisibleColumnsChange,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<DowntimeIncident>[]>([]);

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
        id: "assets",
        accessorKey: "assets",
        header: "Assets",
        cell: ({ row }) => {
          const assets = row.original.assets;

          return (
            <div className="w-130 relative">
              {assets.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-2">
                  {assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="rounded-lg border border-outlineVariant/40 bg-surfaceContainerHighest px-3 py-2 shadow-sm transition hover:border-primary/60 min-w-0"
                      title={`${asset.name} (${asset.id})`}
                    >
                      <div className="text-sm font-medium text-onSurface break-words" title={asset.name}>
                        {asset.name} <span className="text-xs text-onSurfaceVariant">({asset.id})</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-onSurfaceVariant">—</div>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: "priority",
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
        id: "startTime",
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
        id: "description",
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }) => {
          const description = getValue() as string;
          return (
            <div>
              <div className="line-clamp-2 break-words" title={description}>
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

  // Row actions configuration
  const rowActions: RowAction<DowntimeIncident>[] = useMemo(() => {
    const actions: RowAction<DowntimeIncident>[] = [
      { type: "edit", onClick: onEditIncident },
    ];

    if (onDeleteIncident) {
      actions.push({ type: "delete", onClick: onDeleteIncident });
    }
    return actions;
  }, [onEditIncident, onDeleteIncident]);

  // Initialize visible columns with all columns on first render
  useEffect(() => {
    if (visibleColumns.length === 0 && columns.length > 0) {
      setVisibleColumns(columns);
    }
  }, [columns, visibleColumns.length]);

  // Notify parent when visible columns change
  useEffect(() => {
    if (onVisibleColumnsChange && visibleColumns.length > 0) {
      onVisibleColumnsChange(visibleColumns);
    }
  }, [onVisibleColumnsChange, visibleColumns]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="title-medium font-medium text-onSurface">Current Incidents ({filteredIncidents.length})</h2>
        <div className="flex items-center gap-2">
          <TableColumnVisibility columns={columns} visibleColumns={visibleColumns} setVisibleColumns={setVisibleColumns}/>
          <div className="flex-shrink-0 w-80">
            <Search searchValue={searchQuery} onSearch={setSearchQuery} searchPlaceholder="Search incidents..." live={true} />
          </div>
        </div>
      </div>
      
      <DataTableExtended 
        columns={visibleColumns} 
        data={filteredIncidents} 
        showPagination={true} 
        onRowDoubleClick={onEditIncident}
        rowActions={rowActions}
      />
    </div>
  );
};
