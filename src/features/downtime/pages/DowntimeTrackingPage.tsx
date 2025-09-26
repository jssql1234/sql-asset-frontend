import React, { useState, useMemo } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import { Button } from "@/components/ui/components";
import SummaryCards, { type SummaryCardItem } from "@/components/SummaryCards";
import { DataTable } from "@/components/ui/components/Table";
import { type ColumnDef } from "@tanstack/react-table";
import type {
  DowntimeIncident,
  DowntimeSummary,
  FilterState,
  ModalState,
} from "../types/downtime";
import { LogDowntimeModal } from "../components/LogDowntimeModal";
import { EditIncidentModal } from "../components/EditIncidentModal";
import { ResolvedIncidentsModal } from "../components/ResolvedIncidentsModal";
import { DowntimeFilters } from "../components/DowntimeFilters";
import { Clock, AlertTriangleFilled, CircleCheck, Gauge } from "@/assets/icons";

// Mock data - in real app this would come from API
const mockIncidents: DowntimeIncident[] = [
  {
    id: "1",
    assetName: "Conveyor Belt A1",
    assetId: "CBT-001",
    priority: "High",
    status: "Active",
    startTime: "2025-09-26T08:30:00Z",
    description: "Motor overheating causing system shutdown",
    reportedBy: "John Smith",
  },
  {
    id: "2",
    assetName: "Pump System B2",
    assetId: "PMP-002", 
    priority: "Medium",
    status: "In Progress",
    startTime: "2025-09-26T06:15:00Z",
    description: "Pressure valve malfunction",
    reportedBy: "Jane Doe",
  },
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
];

const mockSummary: DowntimeSummary = {
  activeIncidents: 1,
  totalIncidents: 15,
  totalResolved: 12,
  totalDowntime: "48h 32m",
};

const DowntimeTrackingPage: React.FC = () => {
  const [incidents] = useState<DowntimeIncident[]>(mockIncidents);
  const [summary] = useState<DowntimeSummary>(mockSummary);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    asset: "",
    status: "",
    priority: "",
  });
  const [modals, setModals] = useState<ModalState>({
    logDowntime: false,
    editIncident: false,
    resolvedIncidents: false,
  });
  const [selectedIncident, setSelectedIncident] = useState<DowntimeIncident | null>(null);

  // Summary cards data
  const summaryCardsData: SummaryCardItem[] = useMemo(
    () => [
      {
        label: "Active Incidents",
        value: summary.activeIncidents,
        icon: <AlertTriangleFilled className="h-5 w-5" />,
        tone: summary.activeIncidents > 0 ? "danger" : "success",
      },
      {
        label: "Total Incidents",
        value: summary.totalIncidents,
        icon: <Clock className="h-5 w-5" />,
        tone: "default",
      },
      {
        label: "Total Resolved", 
        value: summary.totalResolved,
        icon: <CircleCheck className="h-5 w-5" />,
        tone: "success",
      },
      {
        label: "Total Downtime",
        value: summary.totalDowntime,
        icon: <Gauge className="h-5 w-5" />,
        tone: "warning",
      },
    ],
    [summary]
  );

  // Filter incidents based on current filters
  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch = 
        incident.assetName.toLowerCase().includes(filters.search.toLowerCase()) ||
        incident.description.toLowerCase().includes(filters.search.toLowerCase());
      const matchesAsset = !filters.asset || incident.assetId === filters.asset;
      const matchesStatus = !filters.status || incident.status === filters.status;
      const matchesPriority = !filters.priority || incident.priority === filters.priority;
      
      return matchesSearch && matchesAsset && matchesStatus && matchesPriority;
    });
  }, [incidents, filters]);

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
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const statusColors = {
            Active: "bg-error text-white",
            "In Progress": "bg-warning text-white",
            Resolved: "bg-green text-white",
          };
          return (
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status as keyof typeof statusColors] || "bg-gray-500 text-white"}`}>
              {status}
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
          const endTime = getValue() as string | undefined;
          if (!endTime) return <span className="text-onSurfaceVariant">-</span>;
          
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
          const duration = getValue() as string | undefined;
          return duration || <span className="text-onSurfaceVariant">Ongoing</span>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedIncident(row.original);
                setModals((prev: ModalState) => ({ ...prev, editIncident: true }));
              }}
            >
              Edit
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev: FilterState) => ({ ...prev, ...newFilters }));
  };

  const handleModalClose = (modalKey: keyof ModalState) => {
    setModals((prev: ModalState) => ({ ...prev, [modalKey]: false }));
    if (modalKey === "editIncident") {
      setSelectedIncident(null);
    }
  };

  return (
    <AssetLayout activeSidebarItem="downtime-tracking">
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="title-large font-semibold text-onSurface">Downtime Tracking</h1>
            <p className="body-medium text-onSurfaceVariant mt-1">
              Monitor and manage asset downtime incidents
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setModals((prev: ModalState) => ({ ...prev, resolvedIncidents: true }))}
            >
              View Resolved
            </Button>
            <Button
              variant="default"
              onClick={() => setModals((prev: ModalState) => ({ ...prev, logDowntime: true }))}
            >
              Log Downtime
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <SummaryCards data={summaryCardsData} columns={4} />

        {/* Filters */}
        <DowntimeFilters
          filters={filters}
          onFiltersChange={handleFilterChange}
        />

        {/* Data Table */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="title-medium font-medium text-onSurface">
              Current Incidents ({filteredIncidents.length})
            </h2>
          </div>
          
          <DataTable
            columns={columns}
            data={filteredIncidents}
            showPagination={true}
            className="border border-outline"
          />
        </div>
      </div>

      {/* Modals */}
      <LogDowntimeModal
        open={modals.logDowntime}
        onClose={() => handleModalClose("logDowntime")}
      />
      
      <EditIncidentModal
        open={modals.editIncident}
        incident={selectedIncident}
        onClose={() => handleModalClose("editIncident")}
      />
      
      <ResolvedIncidentsModal
        open={modals.resolvedIncidents}
        onClose={() => handleModalClose("resolvedIncidents")}
      />
    </AssetLayout>
  );
};

export default DowntimeTrackingPage;