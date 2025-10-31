import React, { useMemo, useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import type { DowntimeIncident } from "@/features/downtime/types";
import Search from "@/components/Search";
import { formatDate, formatTime } from "@/features/downtime/services/downtimeService";
import { getPriorityVariant } from "@/features/downtime/constants";
import { X } from "lucide-react";
import TableColumnVisibility from "@/components/ui/components/Table/TableColumnVisibility";

interface DowntimeTableProps {
  incidents: DowntimeIncident[];
  onEditIncident: (incident: DowntimeIncident) => void;
}

export const DowntimeTable: React.FC<DowntimeTableProps> = ({
  incidents,
  onEditIncident,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openAssetPopover, setOpenAssetPopover] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<ColumnDef<DowntimeIncident>[]>([]);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpenAssetPopover(null);
        setPopoverPosition(null);
      }
    };

    if (openAssetPopover) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openAssetPopover]);

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
          const maxDisplay = 2;
          const displayedAssets = assets.slice(0, maxDisplay);
          const remainingCount = assets.length - maxDisplay;
          const rowId = row.id;

          return (
            <div className="w-130 relative">
              {assets.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-2">
                    {displayedAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="rounded-lg border border-outlineVariant/40 bg-surfaceContainerHighest px-3 py-2 shadow-sm transition hover:border-primary/60"
                        title={`${asset.name} (${asset.id})`}
                      >
                        <div className="text-sm font-medium text-onSurface truncate" title={asset.name}>
                          {asset.name} <span className="text-xs text-onSurfaceVariant">({asset.id})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {remainingCount > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer underline decoration-dotted underline-offset-2"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const popoverHeight = 240; // max-h-60 = 240px
                          const spaceBelow = window.innerHeight - rect.bottom;
                          const spaceAbove = rect.top;
                          
                          // Position above if not enough space below and there's more space above
                          const shouldPositionAbove = spaceBelow < popoverHeight + 10 && spaceAbove > spaceBelow;
                          
                          setPopoverPosition({
                            top: shouldPositionAbove 
                              ? rect.top + window.scrollY - popoverHeight - 4 
                              : rect.bottom + window.scrollY + 4,
                            left: rect.left + window.scrollX
                          });
                          setOpenAssetPopover(rowId);
                        }}
                      >
                        +{remainingCount} more asset{remainingCount !== 1 ? 's' : ''}
                      </button>
                      
                      {/* Popover showing all assets */}
                      {openAssetPopover === rowId && popoverPosition && (
                        <div 
                          ref={popoverRef}
                          className="fixed z-[9999] w-80 max-h-60 overflow-y-auto bg-surface border border-outlineVariant rounded-lg shadow-lg"
                          style={{
                            top: popoverPosition.top,
                            left: popoverPosition.left
                          }}
                        >
                          <div className="sticky top-0 bg-surface border-b border-outlineVariant px-3 py-2 flex items-center justify-between">
                            <div className="text-sm font-medium text-onSurface">Additional Assets ({remainingCount})</div>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenAssetPopover(null);
                                setPopoverPosition(null);
                              }}
                              className="text-onSurfaceVariant hover:text-onSurface transition-colors"
                              aria-label="Close"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="p-3 space-y-2">
                            {assets.slice(maxDisplay).map((asset) => (
                              <div
                                key={asset.id}
                                className="flex items-center justify-between p-2 rounded-md bg-surfaceContainerHighest border border-outlineVariant/40"
                              >
                                <div className="text-sm font-medium text-onSurface truncate">
                                  {asset.name}
                                </div>
                                <div className="text-xs text-onSurfaceVariant ml-2">
                                  ({asset.id})
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
    [openAssetPopover, popoverPosition]
  );

  // Initialize visible columns with all columns on first render
  useEffect(() => {
    if (visibleColumns.length === 0 && columns.length > 0) {
      setVisibleColumns(columns);
    }
  }, [columns, visibleColumns.length]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="title-medium font-medium text-onSurface">
          Current Incidents ({filteredIncidents.length})
        </h2>
        <div className="flex items-center gap-2">
          <TableColumnVisibility
            columns={columns}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
          <div className="flex-shrink-0 w-80">
            <Search searchValue={searchQuery} onSearch={setSearchQuery} searchPlaceholder="Search incidents..." live={true} />
          </div>
        </div>
      </div>
      
      <DataTableExtended columns={visibleColumns} data={filteredIncidents} showPagination={true} onRowDoubleClick={onEditIncident} />
    </div>
  );
};
