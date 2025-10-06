import React, { useState } from "react";
import { AssetLayout } from "@/layout/AssetSidebar";
import type { DowntimeIncident, DowntimeSummary, FilterState, ModalState } from "@/features/downtime/types";
import { LogDowntimeModal } from "@/features/downtime/components/LogDowntimeModal";
import { EditIncidentModal } from "@/features/downtime/components/EditIncidentModal";
import { ResolvedIncidentsModal } from "@/features/downtime/components/ResolvedIncidentsModal";
import { DowntimeSearchFilter } from "@/features/downtime/components/DowntimeSearchFilter";
import { DowntimeTable } from "@/features/downtime/components/DowntimeTable";
import { DowntimeSummaryCard } from "@/features/downtime/components/DowntimeSummaryCard";
import { DowntimeTabHeader } from "@/features/downtime/components/DowntimeTabHeader";
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
        <DowntimeTabHeader
          onViewResolved={() => setModals((prev: ModalState) => ({ ...prev, resolvedIncidents: true }))}
          onLogDowntime={() => setModals((prev: ModalState) => ({ ...prev, logDowntime: true }))}
        />

        {/* Summary Cards */}
        <DowntimeSummaryCard summary={summary} />

        {/* Filters */}
        <DowntimeSearchFilter
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