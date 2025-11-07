import { useState } from "react";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import type { DowntimeIncident, ModalState } from "@/features/downtime/types";
import { LogDowntimeModal } from "@/features/downtime/components/LogDowntimeModal";
import { ResolvedIncidentsModal } from "@/features/downtime/components/ResolvedIncidentsModal";
import { DowntimeTable } from "@/features/downtime/components/DowntimeTable";
import { DowntimeSummaryCard } from "@/features/downtime/components/DowntimeSummaryCard";
import { DowntimeTabHeader } from "@/features/downtime/components/DowntimeTabHeader";
import { useGetDowntimeIncidents, useGetDowntimeSummary, useDeleteDowntimeIncident } from "@/features/downtime/hooks/useDowntimeService";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";

function DowntimeTrackingPage() {
  // Fetch data using hooks
  const { data: allIncidents = [] } = useGetDowntimeIncidents();
  const { data: summary } = useGetDowntimeSummary();
  const deleteIncidentMutation = useDeleteDowntimeIncident();
  const [modals, setModals] = useState<ModalState>({ logDowntime: false, editIncident: false, resolvedIncidents: false });
  const [selectedIncident, setSelectedIncident] = useState<DowntimeIncident | null>(null);
  const [incidentToDelete, setIncidentToDelete] = useState<DowntimeIncident | null>(null);

  const handleEditIncident = (incident: DowntimeIncident) => {
    setSelectedIncident(incident);
    setModals((prev: ModalState) => ({ ...prev, editIncident: true }));
  };

  const handleDeleteIncident = (incident: DowntimeIncident) => {
    setIncidentToDelete(incident);
  };

  const handleConfirmDelete = () => {
    if (incidentToDelete) {
      deleteIncidentMutation.mutate(incidentToDelete.id);
      setIncidentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIncidentToDelete(null);
  };

  const handleModalClose = (modalKey: keyof ModalState) => {
    setModals((prev: ModalState) => ({ ...prev, [modalKey]: false }));
    if (modalKey === "editIncident") {
      setSelectedIncident(null);
    }
  };

  return (
    <AppLayout>

      <div className="flex flex-col gap-6 p-1">
        <DowntimeTabHeader
          onViewResolved={() => {
            setModals((prev: ModalState) => ({ ...prev, resolvedIncidents: true }));
          }}
          onLogDowntime={() => {
            setModals((prev: ModalState) => ({ ...prev, logDowntime: true }));
          }}
        />

        {summary ? (
          <DowntimeSummaryCard summary={summary} />
        ) : null}

        <DowntimeTable incidents={allIncidents} onEditIncident={handleEditIncident} onDeleteIncident={handleDeleteIncident}/>
      </div>

      <LogDowntimeModal
        open={modals.logDowntime || modals.editIncident}
        incident={selectedIncident ?? undefined}
        onClose={() => {
          handleModalClose("logDowntime");
          handleModalClose("editIncident");
        }}
      />
      <ResolvedIncidentsModal open={modals.resolvedIncidents} onClose={() => { handleModalClose("resolvedIncidents") }}/>

      <DeleteConfirmationDialog
        isOpen={!!incidentToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete incident?"
        description="This will permanently remove the downtime incident for the following assets. This action cannot be undone."
        confirmButtonText="Delete Incident"
        itemIds={incidentToDelete?.assets.map((asset) => asset.id) ?? []}
        itemNames={incidentToDelete?.assets.map((asset) => `${asset.name} (${asset.id})`) ?? []}
        itemCount={incidentToDelete?.assets.length ?? 0}
      />
    </AppLayout>
  );
};

export default DowntimeTrackingPage;
