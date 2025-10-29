import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import { type ColumnDef } from "@tanstack/react-table";
import Search from "@/components/Search";
import type { DowntimeIncident } from "@/features/downtime/types";
import { getPriorityVariant } from "@/features/downtime/constants";
import { useGetResolvedIncidents } from "@/features/downtime/hooks/useDowntimeService";
import { formatDate, formatTime } from "@/features/downtime/services/downtimeService";

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
          <div className="space-y-1">
            {row.original.assets.length > 0 ? (
              <>
                <div className="font-medium">{row.original.assets[0]?.name}</div>
                <div className="text-sm text-onSurfaceVariant">{row.original.assets[0]?.id}</div>
                {row.original.assets.length > 1 && (
                  <div className="text-xs text-onSurfaceVariant">
                    +{row.original.assets.length - 1} more asset{row.original.assets.length - 1 === 1 ? "" : "s"}
                  </div>
                )}
              </>
            ) : (
              <div className="text-onSurfaceVariant">—</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => {
          const priority = getValue() as DowntimeIncident["priority"];
          return <Badge text={priority} variant={getPriorityVariant(priority)} />;
        },
      },
      {
        accessorKey: "startTime",
        header: "Start Time",
        enableColumnFilter: false,
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
        enableColumnFilter: false,
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