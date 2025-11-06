import { useMemo, useState } from "react";
import Search from "@/components/Search";
import type { MeterGroup, MeterGroupInput, Meter } from "@/types/meter";
import type { Asset } from "@/types/asset";
import { Plus } from "@/assets/icons";
import TabHeader from "@/components/TabHeader";
import CreateGroupModal from "../components/CreateGroupModal";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import MeterGroupsList from "../components/MeterGroupsList";

type MeterGroupsViewProps = {
  groups: MeterGroup[];
  availableAssets: Asset[];
  onCreateGroup: (input: MeterGroupInput) => void;
  onEditGroup: (groupId: string, name: string, description: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onCloneGroup: (groupId: string) => void;
  onAddMeter?: (groupId: string, meter: Meter) => void;
  onEditMeter?: (groupId: string, meterId: string, meter: Meter) => void;
  onDeleteMeter?: (groupId: string, meterId: string) => void;
  onAssignAssets?: (groupId: string, assetIds: string[]) => void;
};

export const MeterGroupsView = ({
  groups,
  availableAssets,
  onCreateGroup,
  onEditGroup,
  onDeleteGroup,
  onCloneGroup,
  onAddMeter,
  onEditMeter,
  onDeleteMeter,
  onAssignAssets,
}: MeterGroupsViewProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<MeterGroup | null>(null);

  const handleCreateGroup = (input: MeterGroupInput) => {
    onCreateGroup(input);
  };

  const handleDeleteGroup = () => {
    if (groupToDelete) {
      onDeleteGroup(groupToDelete.id);
      setGroupToDelete(null);
    }
  };

  const handleDeleteClick = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setGroupToDelete(group);
    }
  };



  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups;

    const query = searchQuery.toLowerCase();
    return groups.filter((group) => 
      group.name.toLowerCase().includes(query) ||
      group.description?.toLowerCase().includes(query) ||
      group.meters.some((meter) => 
        meter.uom.toLowerCase().includes(query)
      ) ||
      group.assignedAssets.some((asset) => 
        asset.id.toLowerCase().includes(query) || 
        asset.name.toLowerCase().includes(query)
      )
    );
  }, [groups, searchQuery]);

  return (
    <div className="flex flex-col gap-6">
      <TabHeader
        title="Meter groups"
        subtitle="Organize meters by asset group. Configure conditions on individual meters to trigger notifications and work orders."
        actions={[
          {
            label: "New group",
            onAction: () => setIsCreateModalOpen(true),
            icon: <Plus className="size-5" />,
            variant: "primary",
          },
        ]}
      />

      <Search
        searchValue={searchQuery}
        searchPlaceholder="Search by group name, meter, or asset"
        onSearch={setSearchQuery}
        live
      />

      <MeterGroupsList
        groups={filteredGroups}
        availableAssets={availableAssets}
        onEditGroup={onEditGroup}
        onCloneGroup={onCloneGroup}
        onDeleteGroup={handleDeleteClick}
        onAddMeter={onAddMeter}
        onEditMeter={onEditMeter}
        onDeleteMeter={onDeleteMeter}
        onAssignAssets={onAssignAssets}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSave={handleCreateGroup}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={!!groupToDelete}
        onClose={() => setGroupToDelete(null)}
        onConfirm={handleDeleteGroup}
        title="Delete Meter Group"
        description={
          groupToDelete
            ? `Are you sure you want to delete the meter group "${groupToDelete.name}"? This will affect ${groupToDelete.assignedAssets.length} assigned asset(s) and ${groupToDelete.meters.length} meter(s). This action cannot be undone.`
            : undefined
        }
        itemName={groupToDelete?.name}
        confirmButtonText="Delete Group"
      />
    </div>
  );
};

export default MeterGroupsView;
