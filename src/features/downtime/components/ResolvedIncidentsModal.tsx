import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import Search from "@/components/Search";
import type { DowntimeIncident } from "@/features/downtime/types";
import { PRIORITY_BADGE_VARIANT } from "@/features/downtime/constants";
import { useGetResolvedIncidents } from "@/features/downtime/hooks/useDowntimeService";
import { formatDate, formatTime } from "@/features/downtime/utils/downtimeUtils";

interface ResolvedIncidentsModalProps {
  open: boolean;
  onClose: () => void;
}

export const ResolvedIncidentsModal: React.FC<ResolvedIncidentsModalProps> = ({
  open,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const { data: resolvedIncidents = [], isLoading } = useGetResolvedIncidents({ enabled: open });

  // Filter incidents based on search
  const filteredIncidents = useMemo(() => {
    if (!searchValue.trim()) return resolvedIncidents;
    
    return resolvedIncidents.filter((incident) => 
      incident.assetName.toLowerCase().includes(searchValue.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      incident.resolutionNotes?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, resolvedIncidents]);

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
          return <Badge text={priority} variant={PRIORITY_BADGE_VARIANT[priority]} />;
        },
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
      },
      {
        accessorKey: "endTime",
        header: "End Time",
        cell: ({ getValue }) => {
          const endTime = getValue() as string | undefined;
          if (!endTime) {
            return <span className="text-onSurfaceVariant">Pending</span>;
          }
          return (
            <div>
              <div>{formatDate(endTime)}</div>
              <div className="text-sm text-onSurfaceVariant">{formatTime(endTime)}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "downtimeDuration",
        header: "Duration",
        cell: ({ getValue }) => {
          const duration = getValue() as string;
          return <span className="font-medium">{duration}</span>;
        },
      },
      {
        accessorKey: "resolutionNotes",
        header: "Resolution",
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
    []
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
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
            Showing {filteredIncidents.length} resolved incident
            {filteredIncidents.length !== 1 ? "s" : ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};