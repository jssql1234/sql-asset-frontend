import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/layout/sidebar/AppLayout";
import { Button } from "@/components/ui/components";
import MeterTable from "../components/MeterTable";
import EditMeterModal from "../components/EditMeterModal";
import EditGroupModal from "../components/EditGroupModal";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import MeterGroupHeader from "../components/MeterGroupHeader";
import AssignedAssetsSection from "../components/AssignedAssetsSection";
import AssignAssetsModal from "../components/AssignAssetsModal";
import { useMeterManagement } from "../hooks/useMeterManagement";
import { ArrowLeft } from "@/assets/icons";
import type { Meter } from "@/types/meter";

const MeterGroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const {
    meterGroups,
    availableAssets,
    addMeterToGroup,
    updateMeter,
    removeMeter,
    updateGroup,
    assignAssetsToGroup,
  } = useMeterManagement();

  const [editingMeter, setEditingMeter] = useState<Meter | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [meterToDelete, setMeterToDelete] = useState<string | null>(null);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [isAssignAssetsModalOpen, setIsAssignAssetsModalOpen] = useState(false);

  const group = meterGroups.find(g => g.id === groupId);

  const handleEditMeter = (meterId: string) => {
    const meter = group?.meters.find(m => m.id === meterId);
    if (meter) {
      setEditingMeter(meter);
      setIsEditModalOpen(true);
    }
  };

  const handleAddMeter = () => {
    // Create a new meter with default values for the modal
    const newMeter: Meter = {
      id: `m-${Date.now()}`, // Temporary ID, will be replaced when saved
      uom: "",
      conditions: [],
    };
    setEditingMeter(newMeter);
    setIsAddModalOpen(true);
  };

  const handleSaveMeter = (meter: Meter) => {
    if (!groupId) return;

    if (isAddModalOpen) {
      // Adding a new meter - pass the meter directly
      addMeterToGroup(groupId, meter);
      setIsAddModalOpen(false);
    } else {
      // Updating existing meter
      updateMeter(groupId, meter.id, {
        uom: meter.uom,
        conditions: meter.conditions,
      });
      setIsEditModalOpen(false);
    }
    setEditingMeter(null);
  };

  const handleRemoveMeter = (meterId: string) => {
    setMeterToDelete(meterId);
  };

  const confirmRemoveMeter = () => {
    if (meterToDelete && groupId) {
      removeMeter(groupId, meterToDelete);
      setMeterToDelete(null);
    }
  };

  const handleEditGroup = () => {
    setIsEditGroupModalOpen(true);
  };

  const handleSaveGroup = (groupId: string, name: string, description: string) => {
    updateGroup(groupId, { name, description });
  };

  const handleAssignAssets = (assetIds: string[]) => {
    if (!groupId) return;
    assignAssetsToGroup(groupId, assetIds);
  };

  if (!group) {
    return (
      <AppLayout
        breadcrumbs={[
          { label: "Asset Maintenance" },
          { label: "Meter Reading" },
          { label: "Group Not Found" }
        ]}
      >
        <div className="flex h-full flex-col items-center justify-center gap-4">
          <h2 className="text-xl font-semibold text-onSurface">Group not found</h2>
          <p className="text-onSurfaceVariant">The requested meter group could not be found.</p>
          <Button onClick={() => navigate("/meter-reading")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Meter Groups
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      breadcrumbs={[
        { label: "Asset Maintenance" },
        { label: "Meter Reading" },
        { label: group.name }
      ]}
    >
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/meter-reading")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Button>
        </div>

        <div className="space-y-4">
          <MeterGroupHeader group={group} onEdit={handleEditGroup} />

          <AssignedAssetsSection
            assets={group.assignedAssets}
            onAssignAssets={() => setIsAssignAssetsModalOpen(true)}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-onSurface">Meters</h2>
              <Button variant="primary" size="sm" onClick={handleAddMeter}>
                Add Meter
              </Button>
            </div>

            <MeterTable
              meters={group.meters}
              onEdit={handleEditMeter}
              onRemove={handleRemoveMeter}
            />
          </div>
        </div>
      </div>

      {/* Edit Meter Modal */}
      <EditMeterModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        meter={editingMeter}
        onSave={handleSaveMeter}
      />

      {/* Add Meter Modal */}
      <EditMeterModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        meter={editingMeter}
        onSave={handleSaveMeter}
      />

      {/* Delete Meter Confirmation */}
      <DeleteConfirmationDialog
        isOpen={!!meterToDelete}
        onClose={() => setMeterToDelete(null)}
        onConfirm={confirmRemoveMeter}
        title="Delete Meter"
        description={`Are you sure you want to delete the meter with UOM "${meterToDelete ? group?.meters.find(m => m.id === meterToDelete)?.uom : ''}"? This action cannot be undone.`}
        itemName={meterToDelete ? group?.meters.find(m => m.id === meterToDelete)?.uom : undefined}
      />

      {/* Edit Group Modal */}
      <EditGroupModal
        open={isEditGroupModalOpen}
        onOpenChange={setIsEditGroupModalOpen}
        group={group}
        onSave={handleSaveGroup}
      />

      {/* Assign Assets Modal */}
      <AssignAssetsModal
        open={isAssignAssetsModalOpen}
        onOpenChange={setIsAssignAssetsModalOpen}
        availableAssets={availableAssets}
        currentAssets={group.assignedAssets}
        onAssign={handleAssignAssets}
      />
    </AppLayout>
  );
};

export default MeterGroupDetailPage;
