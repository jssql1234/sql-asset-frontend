import React, { useState } from "react";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";
import type { DowntimeIncident, ModalState } from "@/features/downtime/types";
import { LogDowntimeModal } from "@/features/downtime/components/LogDowntimeModal";
import { EditIncidentModal } from "@/features/downtime/components/EditIncidentModal";
import { ResolvedIncidentsModal } from "@/features/downtime/components/ResolvedIncidentsModal";
import { DowntimeTable } from "@/features/downtime/components/DowntimeTable";
import { DowntimeSummaryCard } from "@/features/downtime/components/DowntimeSummaryCard";
import { DowntimeTabHeader } from "@/features/downtime/components/DowntimeTabHeader";
import { useGetDowntimeIncidents, useGetDowntimeSummary } from "@/features/downtime/hooks/useDowntimeService";

const DowntimeTrackingPage: React.FC = () => {
  // Fetch data using hooks
  const { data: allIncidents = [], isLoading: isLoadingIncidents } = useGetDowntimeIncidents();
  const { data: summary, isLoading: isLoadingSummary } = useGetDowntimeSummary();
  
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

  const handleModalClose = (modalKey: keyof ModalState) => {
    setModals((prev: ModalState) => ({ ...prev, [modalKey]: false }));
    if (modalKey === "editIncident") {
      setSelectedIncident(null);
    }
  };

  return (
    <SidebarHeader
      breadcrumbs={[ { label: "Asset Maintenance" }, { label: "Downtime Tracking" } ]}>
        
      <div className="flex flex-col gap-6 p-1">
        <DowntimeTabHeader
          onViewResolved={() => setModals((prev: ModalState) => ({ ...prev, resolvedIncidents: true }))}
          onLogDowntime={() => setModals((prev: ModalState) => ({ ...prev, logDowntime: true }))}
        />

        {isLoadingSummary ? (
          <div className="flex items-center justify-center p-8">
            <span className="text-onSurfaceVariant">Loading summary...</span>
          </div>
        ) : summary ? (
          <DowntimeSummaryCard summary={summary} />
        ) : null}

        {isLoadingIncidents ? (
          <div className="flex items-center justify-center p-8">
            <span className="text-onSurfaceVariant">Loading incidents...</span>
          </div>
        ) : (
          <DowntimeTable
            incidents={allIncidents}
            onEditIncident={handleEditIncident}
          />
        )}
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