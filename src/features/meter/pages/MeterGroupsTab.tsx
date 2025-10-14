import { type ChangeEvent, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import { AssetChip } from "@/components/AssetChip";
import { DataTableExtended } from "@/components/DataTableExtended";
import Search from "@/components/Search";
import {
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import type {
  MeterGroup,
  MeterGroupInput,
} from "@/types/meter";
import { Plus } from "@/assets/icons";
import TabHeader from "@/components/TabHeader";

type GroupModalState = { mode: "create" } | { mode: "edit"; group: MeterGroup };

type MeterGroupsViewProps = {
  groups: MeterGroup[];
  onCreateGroup: (input: MeterGroupInput) => void;
  onUpdateGroup: (groupId: string, input: Partial<MeterGroupInput>) => void;
  onDeleteGroup: (groupId: string) => void;
  onCloneGroup: (groupId: string) => void;
};

const defaultGroupForm: MeterGroupInput = {
  name: "",
  description: "", 
};

export const MeterGroupsView = ({
  groups,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onCloneGroup,
}: MeterGroupsViewProps) => {
  const navigate = useNavigate();
  const [groupModal, setGroupModal] = useState<GroupModalState | null>(null);
  const [groupForm, setGroupForm] = useState<MeterGroupInput>(defaultGroupForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);

  const openCreateGroupModal = () => {
    setGroupForm(defaultGroupForm);
    setFormError(null);
    setGroupModal({ mode: "create" });
  };

  const openEditGroupModal = (group: MeterGroup) => {
    setGroupForm({
      name: group.name,
      description: group.description ?? "",
    });
    setFormError(null);
    setGroupModal({ mode: "edit", group });
  };

  const handleGroupSubmit = () => {
    if (!groupForm.name.trim()) {
      setFormError("Group name is required");
      return;
    }

    if (groupModal?.mode === "create") {
      onCreateGroup({
        ...groupForm,
        name: groupForm.name.trim(),
        description: groupForm.description?.trim() || "",
      });
    }

    if (groupModal?.mode === "edit") {
      onUpdateGroup(groupModal.group.id, {
        ...groupForm,
        name: groupForm.name.trim(),
        description: groupForm.description?.trim(),
      });
    }

    setGroupModal(null);
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

  const columns = useMemo<ColumnDef<MeterGroup>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Group Name",
        enableColumnFilter: false,
        cell: ({ row }) => {
          const group = row.original;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-onSurface">{group.name}</span>
              {group.description && (
                <span className="body-small text-onSurfaceVariant">
                  {group.description}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "meters",
        header: "Meters",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const meters = row.original.meters;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-onSurface">
                {meters.length} {meters.length === 1 ? "meter" : "meters"}
              </span>
              {meters.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {meters.slice(0, 3).map((meter) => (
                    <Badge
                      key={meter.id}
                      text={`${meter.uom}`}
                      variant="primary"
                      className="h-6 px-2 py-0.5 text-xs"
                    />
                  ))}
                  {meters.length > 3 && (
                    <Badge
                      text={`+${meters.length - 3} more`}
                      variant="primary"
                      className="h-6 px-2 py-0.5 text-xs"
                    />
                  )}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "assignedAssets",
        header: "Assigned Assets",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const assets = row.original.assignedAssets;
          return (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-onSurface">
                {assets.length} {assets.length === 1 ? "asset" : "assets"}
              </span>
              {assets.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {assets.slice(0, 2).map((asset) => (
                    <AssetChip key={asset.id} asset={asset} />
                  ))}
                  {assets.length > 2 && (
                    <Badge
                      text={`+${assets.length - 2} more`}
                      variant="primary"
                      className="h-6 px-2 py-0.5 text-xs"
                    />
                  )}
                </div>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => {
          const group = row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  openEditGroupModal(group);
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloneGroup(group.id);
                }}
              >
                Clone
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteGroupId(group.id);
                }}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [openEditGroupModal, onCloneGroup]
  );

  const handleViewGroup = (group: MeterGroup) => {
    // Navigate to detail page
    navigate(`/meter-reading/group/${group.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <TabHeader
        title="Meter groups"
        subtitle="Organize meters by asset group. Configure conditions on individual meters to trigger notifications and work orders."
        actions={[
          {
            label: "New group",
            onAction: openCreateGroupModal,
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

      <DataTableExtended<MeterGroup, unknown>
        columns={columns}
        data={filteredGroups}
        showPagination
        onRowDoubleClick={handleViewGroup}
      />

      {groupModal ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setGroupModal(null);
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {groupModal.mode === "create"
                  ? "Create meter group"
                  : `Edit ${groupModal.group.name}`}
              </DialogTitle>
              <DialogDescription>
                Provide a clear name and description for this meter group. Automation and notifications will be controlled through individual meter conditions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Group name</label>
                <Input
                  value={groupForm.name}
                  placeholder="e.g. Plant Utilities"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    setGroupForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Description</label>
                <TextArea
                  rows={4}
                  placeholder="Summary that explains what this meter group is tracking"
                  value={groupForm.description}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setGroupForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                />
              </div>
              {formError ? <p className="text-sm text-error">{formError}</p> : null}
            </div>
            <DialogFooter>
              <div className="flex w-full justify-end gap-2">
                <Button variant="secondary" onClick={() => setGroupModal(null)}>
                  Cancel
                </Button>
                <Button onClick={handleGroupSubmit}>
                  {groupModal.mode === "create" ? "Create group" : "Save changes"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {deleteGroupId ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteGroupId(null);
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete meter group</DialogTitle>
              <DialogDescription>
                This action removes the group, its meters, and associated readings. The action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <div className="flex w-full justify-end gap-2">
                <Button variant="secondary" onClick={() => setDeleteGroupId(null)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDeleteGroup(deleteGroupId);
                    setDeleteGroupId(null);
                  }}
                >
                  Delete group
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
};

export default MeterGroupsView;
