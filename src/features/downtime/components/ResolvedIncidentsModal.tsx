import { useState, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/components";
import { Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import Search from "@/components/Search";
import type { DowntimeIncident } from "@/features/downtime/types";
import { useGetResolvedIncidents } from "@/features/downtime/hooks/useDowntimeService";
import { formatDate, formatTime } from "@/features/downtime/services/downtimeService";

interface ResolvedIncidentsModalProps { open: boolean; onClose: () => void }

export function ResolvedIncidentsModal({ open, onClose }: ResolvedIncidentsModalProps) {
  const [searchValue, setSearchValue] = useState("");
  const { data: resolvedIncidents = [], isLoading } = useGetResolvedIncidents({ enabled: open });

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

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
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1 max-w-150">
            {row.original.assets.map((asset) => (
              <Badge
                key={asset.id}
                text={`${asset.name} (${asset.id})`}
                variant="grey"
                className="h-7 px-3 py-1"
              />
            ))}
          </div>
        ),
      },
      {
        accessorKey: "startTime",
        header: "Start Time",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const startTime = row.original.startTime;
          return (
            <div>
              <div className="text-sm font-medium">{formatDate(startTime)}</div>
              <div className="text-xs text-onSurfaceVariant">{formatTime(startTime)}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "endTime",
        header: "End Time",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const endTime = row.original.endTime;
          return endTime ? (
            <div>
              <div className="text-sm font-medium">{formatDate(endTime)}</div>
              <div className="text-xs text-onSurfaceVariant">{formatTime(endTime)}</div>
            </div>
          ) : (
            <div className="text-sm text-onSurfaceVariant">Pending</div>
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
              <div className="line-clamp-2 break-words" title={notes}>{notes ?? "-"}</div>
            </div>
          );
        },
      },
    ],
    []
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
          <Search searchValue={searchValue} onSearch={setSearchValue} searchPlaceholder="Search resolved incidents..."
                  live className="gap-0" inputClassName="rounded"/>
        </div>

        <div className="flex-1 overflow-y-auto">
          <DataTableExtended columns={columns} data={filteredIncidents} showPagination isLoading={isLoading} className="h-full"/>
        </div>

        <div className="flex-shrink-0 mt-4 text-center">
          <span className="body-small text-onSurfaceVariant">
            Showing {filteredIncidents.length} resolved incident{filteredIncidents.length !== 1 ? "s" : ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}