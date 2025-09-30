import React, { useState } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import { TabHeader } from "@/components/TabHeader";
import type { DowntimeIncident, DowntimeSummary, FilterState, ModalState } from "@/features/downtime/types";
import { LogDowntimeModal } from "@/features/downtime/components/LogDowntimeModal";
import { EditIncidentModal } from "@/features/downtime/components/EditIncidentModal";
import { ResolvedIncidentsModal } from "@/features/downtime/components/ResolvedIncidentsModal";
import { SearchFilter } from "@/features/downtime/components/SearchFilter";
import { DowntimeTable } from "@/features/downtime/components/DowntimeTable";
import { SummaryCard } from "@/features/downtime/components/SummaryCard";
import { mockIncidents, mockSummary } from "@/features/downtime/mockData";

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

  const handleEditIncident = (incident: DowntimeIncident) => {
    setSelectedIncident(incident);
    setModals((prev: ModalState) => ({ ...prev, editIncident: true }));
  };

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
      <div className="flex flex-col gap-6 p-1">
        <TabHeader
          title="Downtime Tracking"
          subtitle="Monitor and manage asset downtime incidents"
          actions={[
            {
              label: "View Resolved",
              onAction: () => setModals((prev: ModalState) => ({ ...prev, resolvedIncidents: true })),
              variant: "outline",
            },
            {
              label: "Log Downtime",
              onAction: () => setModals((prev: ModalState) => ({ ...prev, logDowntime: true })),
              variant: "default",
            },
          ]}
        />

        {/* Summary Cards */}
        <SummaryCard summary={summary} />

        {/* Filters */}
        <SearchFilter
          filters={filters}
          onFiltersChange={handleFilterChange}
        />

        {/* Data Table */}
        <DowntimeTable
          incidents={incidents}
          filters={filters}
          onEditIncident={handleEditIncident}
        />
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