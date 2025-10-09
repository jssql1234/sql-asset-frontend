import React, { useState } from "react";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";
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
    <SidebarHeader
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Downtime Tracking" },
      ]}
    >
      <div className="flex flex-col gap-6 p-1">
        <DowntimeTabHeader
          onViewResolved={() => setModals((prev: ModalState) => ({ ...prev, resolvedIncidents: true }))}
          onLogDowntime={() => setModals((prev: ModalState) => ({ ...prev, logDowntime: true }))}
        />

        <DowntimeSummaryCard summary={summary} />

        <DowntimeSearchFilter
          filters={filters}
          onFiltersChange={handleFilterChange}
        />

        <DowntimeTable
          incidents={incidents}
          filters={filters}
          onEditIncident={handleEditIncident}
        />
      </div>

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
    </SidebarHeader>
  );
};

export default DowntimeTrackingPage;