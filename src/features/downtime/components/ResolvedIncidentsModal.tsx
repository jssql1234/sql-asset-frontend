import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Badge } from "@/components/ui/components";
import { DataTable } from "@/components/ui/components/Table";
import { type ColumnDef } from "@tanstack/react-table";
import SearchFilter from "@/components/SearchFilter";
import type { DowntimeIncident } from "@/features/downtime/types";
import { PRIORITY_BADGE_VARIANT } from "@/features/downtime/components/DowntimeTable";
import { resolvedIncidents } from "@/features/downtime/mockData";

interface ResolvedIncidentsModalProps {
  open: boolean;
  onClose: () => void;
}

export const ResolvedIncidentsModal: React.FC<ResolvedIncidentsModalProps> = ({
  open,
  onClose,
}) => {
  const [searchValue, setSearchValue] = useState("");

  // Filter incidents based on search
  const filteredIncidents = useMemo(() => {
    if (!searchValue.trim()) return resolvedIncidents;
    
    return resolvedIncidents.filter((incident) => 
      incident.assetName.toLowerCase().includes(searchValue.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      incident.resolutionNotes?.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

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
        accessorKey: "endTime",
        header: "End Time",
        cell: ({ getValue }) => {
          const endTime = getValue() as string;
          const date = new Date(endTime);
          return (
            <div>
              <div>{date.toLocaleDateString()}</div>
              <div className="text-sm text-onSurfaceVariant">{date.toLocaleTimeString()}</div>
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
                {notes || "-"}
              </div>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Resolved Incidents</DialogTitle>
        </DialogHeader>
        
        {/* Search */}
        <div className="flex-shrink-0 mb-4">
          <SearchFilter
            searchValue={searchValue}
            onSearch={setSearchValue}
            searchPlaceholder="Search resolved incidents..."
            live
            className="gap-0"
            contentClassName="gap-0"
            inputWrapperClassName="max-w-md"
            inputClassName="rounded"
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <DataTable
            columns={columns}
            data={filteredIncidents}
            showPagination={true}
            className="border border-outline h-full"
          />
        </div>

        <div className="flex-shrink-0 mt-4 text-center">
          <span className="body-small text-onSurfaceVariant">
            Showing {filteredIncidents.length} resolved incident{filteredIncidents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};