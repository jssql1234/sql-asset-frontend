import React, { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button,
} from "@/components/ui/components";
import { DataTable } from "@/components/ui/components/Table";
import { type ColumnDef } from "@tanstack/react-table";
import SearchBar from "@/components/SearchBar";
import type { DowntimeIncident } from "../types/downtime";

interface ResolvedIncidentsModalProps {
  open: boolean;
  onClose: () => void;
}

// Mock resolved incidents data
const resolvedIncidents: DowntimeIncident[] = [
  {
    id: "3",
    assetName: "Generator C3",
    assetId: "GEN-003",
    priority: "Critical",
    status: "Resolved",
    startTime: "2025-09-25T14:20:00Z",
    endTime: "2025-09-25T16:45:00Z",
    downtimeDuration: "2h 25m",
    description: "Complete power failure",
    reportedBy: "Mike Johnson",
    resolvedBy: "Sarah Wilson",
    resolutionNotes: "Replaced faulty alternator",
  },
  {
    id: "4",
    assetName: "Hydraulic Press E5",
    assetId: "HP-005",
    priority: "High",
    status: "Resolved",
    startTime: "2025-09-24T10:30:00Z",
    endTime: "2025-09-24T14:15:00Z",
    downtimeDuration: "3h 45m",
    description: "Hydraulic leak causing pressure drop",
    reportedBy: "David Lee",
    resolvedBy: "Emma Clark",
    resolutionNotes: "Replaced damaged hydraulic seals and refilled fluid",
  },
  {
    id: "5",
    assetName: "Cooling System F6",
    assetId: "CS-006",
    priority: "Medium",
    status: "Resolved",
    startTime: "2025-09-23T16:00:00Z",
    endTime: "2025-09-23T18:30:00Z",
    downtimeDuration: "2h 30m",
    description: "Overheating due to blocked air filters",
    reportedBy: "Lisa Wong",
    resolvedBy: "Tom Brown",
    resolutionNotes: "Cleaned and replaced air filters, system operating normally",
  },
];

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
          const priority = getValue() as string;
          const priorityColors = {
            Low: "bg-blue text-white",
            Medium: "bg-yellow text-black",
            High: "bg-warning text-white", 
            Critical: "bg-error text-white",
          };
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[priority as keyof typeof priorityColors] || "bg-gray-500 text-white"}`}>
              {priority}
            </span>
          );
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
        accessorKey: "resolvedBy",
        header: "Resolved By",
        cell: ({ getValue }) => {
          return <span>{getValue() as string}</span>;
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
          <div className="flex items-center justify-between">
            <DialogTitle>Resolved Incidents</DialogTitle>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogHeader>
        
        {/* Search */}
        <div className="flex-shrink-0 mb-4">
          <SearchBar
            value={searchValue}
            onSearch={setSearchValue}
            placeholder="Search resolved incidents..."
            live={true}
            className="max-w-md"
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