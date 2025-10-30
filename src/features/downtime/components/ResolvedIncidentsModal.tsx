import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import Search from "@/components/Search";
import type { DowntimeIncident } from "@/features/downtime/types";
import { useGetResolvedIncidents } from "@/features/downtime/hooks/useDowntimeService";
import { formatDate, formatTime } from "@/features/downtime/services/downtimeService";
import { X } from "lucide-react";

interface ResolvedIncidentsModalProps { open: boolean; onClose: () => void }

export const ResolvedIncidentsModal: React.FC<ResolvedIncidentsModalProps> = ({
  open,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [openAssetPopover, setOpenAssetPopover] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { data: resolvedIncidents = [], isLoading } = useGetResolvedIncidents({ enabled: open });

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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

  // Filter incidents based on search
  const filteredIncidents = useMemo(() => {
    if (!searchValue.trim()) return resolvedIncidents;
    
    const query = searchValue.toLowerCase();

    return resolvedIncidents.filter((incident) => {
      const assetTokens = incident.assets
        .map((asset) => `${asset.name} ${asset.id}`.toLowerCase())
        .join(" ");
      const descriptionText = incident.description.toLowerCase();
      const resolutionText = incident.resolutionNotes?.toLowerCase() ?? "";

      return (
        assetTokens.includes(query) ||
        descriptionText.includes(query) ||
        resolutionText.includes(query)
      );
    });
  }, [searchValue, resolvedIncidents]);

  // Table column definitions
  const columns: ColumnDef<DowntimeIncident>[] = useMemo(
    () => [
      {
        accessorKey: "assets",
        header: "Assets",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const assets = row.original.assets;
          const displayAssets = assets.slice(0, 2);
          const remainingCount = assets.length - 2;
          const rowId = row.id;

          return (
            <div className="max-w-xl relative">
              {assets.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {displayAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="rounded-lg border border-outlineVariant/40 bg-surfaceContainerHighest px-3 py-2 shadow-sm"
                        title={`${asset.name} (${asset.id})${asset.location ? ` · ${asset.location}` : ""}`}
                      >
                        <div className="text-sm font-medium text-onSurface truncate" title={asset.name}>
                          {asset.name} <span className="text-xs text-onSurfaceVariant">({asset.id})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {remainingCount > 0 && (
                    <button
                      type="button"
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
                            : rect.bottom + window.scrollY + 2,
                          left: rect.left + window.scrollX + 10,
                        });
                        setOpenAssetPopover(rowId);
                      }}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors cursor-pointer underline decoration-dotted underline-offset-2"
                    >
                      +{remainingCount} more asset{remainingCount !== 1 ? "s" : ""}
                    </button>
                  )}

                  {/* Popover showing all assets - rendered via portal */}
                  {openAssetPopover === rowId && popoverPosition && ReactDOM.createPortal(
                    <div
                      ref={popoverRef}
                      className="fixed z-[9999] w-80 max-h-60 overflow-y-auto bg-surface border border-outlineVariant rounded-lg shadow-lg"
                      style={{
                        top: popoverPosition.top,
                        left: popoverPosition.left,
                      }}
                    >
                      <div className="sticky top-0 bg-surface border-b border-outlineVariant px-3 py-2 flex items-center justify-between">
                        <div className="text-sm font-medium text-onSurface">
                          Additional Assets ({remainingCount})
                        </div>
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
                        {assets.slice(2).map((asset) => (
                          <div
                            key={asset.id}
                            className="flex items-center justify-between p-2 rounded-md bg-surfaceContainerHighest border border-outlineVariant/40"
                          >
                            <div className="text-sm font-medium text-onSurface truncate">
                              {asset.name}
                            </div>
                            <div className="text-xs text-onSurfaceVariant ml-2">({asset.id})</div>
                          </div>
                        ))}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
              ) : (
                <div className="text-onSurfaceVariant">—</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "startTime",
        header: "Start / End Time",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const startTime = row.original.startTime;
          const endTime = row.original.endTime;
          return (
            <div className="space-y-1">
              <div>
                <div className="text-sm font-medium">{formatDate(startTime)}</div>
                <div className="text-xs text-onSurfaceVariant">{formatTime(startTime)}</div>
              </div>
              {endTime ? (
                <div>
                  <div className="text-sm font-medium">{formatDate(endTime)}</div>
                  <div className="text-xs text-onSurfaceVariant">{formatTime(endTime)}</div>
                </div>
              ) : (
                <div className="text-sm text-onSurfaceVariant">Pending</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "downtimeDuration",
        header: "Duration",
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const duration = getValue() as string;
          return <span className="font-medium">{duration}</span>;
        },
      },
      {
        accessorKey: "resolutionNotes",
        header: "Resolution",
        enableColumnFilter: false,
        cell: ({ getValue }) => {
          const notes = getValue() as string | undefined;
          return (
            <div className="max-w-xs">
              <div className="truncate" title={notes}>
                {notes ?? "-"}
              </div>
            </div>
          );
        },
      },
    ],
    [openAssetPopover, popoverPosition]
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { 
      if (!isOpen) handleClose(); 
    }}>
      <DialogContent className="w-full max-w-[1100px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Resolved Incidents</DialogTitle>
        </DialogHeader>
        <div className="flex-shrink-0 mb-4">
          <Search
            searchValue={searchValue}
            onSearch={setSearchValue}
            searchPlaceholder="Search resolved incidents..."
            live
            className="gap-0"
            inputClassName="rounded"
          />
        </div>

        <div className="flex-1 overflow-hidden">
          <DataTableExtended
            columns={columns}
            data={filteredIncidents}
            showPagination
            isLoading={isLoading}
            className="h-full"
          />
        </div>

        <div className="flex-shrink-0 mt-4 text-center">
          <span className="body-small text-onSurfaceVariant">
            Showing {filteredIncidents.length} resolved incident{filteredIncidents.length !== 1 ? "s" : ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};