import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SidebarHeader } from "@/layout/sidebar/SidebarHeader";
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/components";
import MeterTable from "../components/MeterTable";
import EditMeterModal from "../components/EditMeterModal";
import { useMeterManagement } from "../hooks/useMeterManagement";
import { ArrowLeft } from "@/assets/icons";
import { AssetChip } from "@/components/AssetChip";
import type { Meter } from "@/types/meter";

const MeterGroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();

  const {
    meterGroups,
    addMeterToGroup,
    updateMeter,
    removeMeter,
  } = useMeterManagement();

  const [editingMeter, setEditingMeter] = useState<Meter | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [meterToDelete, setMeterToDelete] = useState<string | null>(null);

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
      // Adding a new meter
      addMeterToGroup(groupId, {
        id: meter.id,
        uom: meter.uom,
        conditions: meter.conditions,
    });
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

  if (!group) {
    return (
      <SidebarHeader
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
      </SidebarHeader>
    );
  }

  return (
    <SidebarHeader
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
          <div>
            <h1 className="text-2xl font-bold text-onSurface">{group.name}</h1>
            {group.description && (
              <p className="mt-2 text-onSurfaceVariant">{group.description}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-onSurface">Assigned Assets</h2>
              <Button variant="primary" size="sm">
                Assign Assets
              </Button>
            </div>
            {group.assignedAssets.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {group.assignedAssets.map((asset) => (
                  <AssetChip key={asset.id} asset={asset} />
                ))}
              </div>
            ) : (
              <p className="text-onSurfaceVariant">No assets assigned to this group.</p>
            )}
          </div>

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

      {/* Delete Confirmation Dialog */}
      {meterToDelete && (
        <Dialog open onOpenChange={() => setMeterToDelete(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Meter</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this meter? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setMeterToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmRemoveMeter}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </SidebarHeader>
  );
};

export default MeterGroupDetailPage;