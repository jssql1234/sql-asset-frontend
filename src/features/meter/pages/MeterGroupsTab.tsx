import { type ChangeEvent, useMemo, useState } from "react";
import { AssetChip, RemovableAssetChip } from "@/components/AssetChip";
import MeterGroupToggleCard from "../components/MeterGroupToggleCard";
import MeterTable from "../components/MeterTable";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import { cn } from "@/utils/utils";
import type {
  Meter,
  MeterAssignmentStrategy,
  MeterGroup,
  MeterGroupInput,
  MeterInput,
} from "@/types/meter";
import type { Asset } from "@/types/asset";

const boundaryOptions: Array<{ value: MeterGroupInput["boundaryTrigger"]; label: string }> = [
  { value: "none", label: "No automation" },
  { value: "lower", label: "Trigger when readings drop below the lower boundary" },
  { value: "upper", label: "Trigger when readings exceed the upper boundary" },
  { value: "both", label: "Trigger on either lower or upper boundary" },
];

const meterTypeOptions: Array<{
  value: MeterInput["type"];
  label: string;
  helper: string;
}> = [
  {
    value: "numeric",
    label: "Numeric",
    helper: "Captures decimal readings such as temperatures or vibration levels.",
  },
  {
    value: "counter",
    label: "Counter",
    helper: "Accumulates totals such as hours run or production counts.",
  },
  {
    value: "boolean",
    label: "Boolean",
    helper: "Tracks simple true/false or on/off readings.",
  },
  {
    value: "text",
    label: "Text",
    helper: "Stores free-form inspection notes or qualitative observations.",
  },
];

type GroupModalState = { mode: "create" } | { mode: "edit"; group: MeterGroup };
type MeterModalState =
  | { mode: "create"; group: MeterGroup }
  | { mode: "edit"; group: MeterGroup; meter: Meter };
type DeleteMeterState = { group: MeterGroup; meter: Meter };
type AssignModalState = { group: MeterGroup };

type MeterGroupsViewProps = {
  groups: MeterGroup[];
  availableAssets: Asset[];
  onCreateGroup: (input: MeterGroupInput) => void;
  onUpdateGroup: (groupId: string, input: Partial<MeterGroupInput>) => void;
  onDeleteGroup: (groupId: string) => void;
  onCloneGroup: (groupId: string) => void;
  onAddMeter: (groupId: string, input: MeterInput) => Meter;
  onUpdateMeter: (
    groupId: string,
    meterId: string,
    input: Partial<MeterInput>
  ) => void;
  onRemoveMeter: (
    groupId: string,
    meterId: string,
    options?: { deleteReadings?: boolean }
  ) => void;
  onAssignAssets: (
    groupId: string,
    assetIds: string[],
    strategy: MeterAssignmentStrategy
  ) => void;
  onRemoveAsset: (groupId: string, assetId: string) => void;
};

const defaultGroupForm: MeterGroupInput = {
  name: "",
  description: "",
  boundaryTrigger: "none",
};

const defaultMeterForm: MeterInput = {
  name: "",
  unit: "",
  type: "numeric",
  lowerBoundary: undefined,
  upperBoundary: undefined,
};

export const MeterGroupsView = ({
  groups,
  availableAssets,
  onCreateGroup,
  onUpdateGroup,
  onDeleteGroup,
  onCloneGroup,
  onAddMeter,
  onUpdateMeter,
  onRemoveMeter,
  onAssignAssets,
  onRemoveAsset,
}: MeterGroupsViewProps) => {
  const [groupModal, setGroupModal] = useState<GroupModalState | null>(null);
  const [meterModal, setMeterModal] = useState<MeterModalState | null>(null);
  const [deleteMeterState, setDeleteMeterState] = useState<DeleteMeterState | null>(
    null
  );
  const [assignModal, setAssignModal] = useState<AssignModalState | null>(null);
  const [groupForm, setGroupForm] = useState<MeterGroupInput>(defaultGroupForm);
  const [meterForm, setMeterForm] = useState<MeterInput>(defaultMeterForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const assetAssignments = useMemo(() => {
    const map = new Map<string, { groupId: string; groupName: string }>();
    groups.forEach((group) => {
      group.assignedAssets.forEach((asset) => {
        map.set(asset.id, { groupId: group.id, groupName: group.name });
      });
    });
    return map;
  }, [groups]);

  const openCreateGroupModal = () => {
    setGroupForm(defaultGroupForm);
    setFormError(null);
    setGroupModal({ mode: "create" });
  };

  const openEditGroupModal = (group: MeterGroup) => {
    setGroupForm({
      name: group.name,
      description: group.description ?? "",
      boundaryTrigger: group.boundaryTrigger,
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

  const openCreateMeterModal = (group: MeterGroup) => {
    setMeterForm(defaultMeterForm);
    setFormError(null);
    setMeterModal({ mode: "create", group });
  };

  const openEditMeterModal = (group: MeterGroup, meter: Meter) => {
    setMeterForm({
      name: meter.name,
      unit: meter.unit,
      type: meter.type,
      lowerBoundary: meter.lowerBoundary,
      upperBoundary: meter.upperBoundary,
    });
    setFormError(null);
    setMeterModal({ mode: "edit", group, meter });
  };

  const handleMeterSubmit = () => {
    if (!meterForm.name.trim()) {
      setFormError("Meter name is required");
      return;
    }

    if (!meterForm.unit.trim()) {
      setFormError("Measurement unit is required");
      return;
    }

    if (meterModal?.mode === "create") {
      onAddMeter(meterModal.group.id, {
        ...meterForm,
        name: meterForm.name.trim(),
        unit: meterForm.unit.trim(),
      });
    }

    if (meterModal?.mode === "edit") {
      onUpdateMeter(meterModal.group.id, meterModal.meter.id, {
        ...meterForm,
        name: meterForm.name.trim(),
        unit: meterForm.unit.trim(),
      });
    }

    setMeterModal(null);
  };

  const handleDeleteMeter = (deleteReadings: boolean) => {
    if (!deleteMeterState) return;
    onRemoveMeter(deleteMeterState.group.id, deleteMeterState.meter.id, {
      deleteReadings,
    });
    setDeleteMeterState(null);
  };

  const renderGroupCard = (group: MeterGroup) => {
    const boundaryLabel =
      boundaryOptions.find((option) => option.value === group.boundaryTrigger)?.label ??
      "—";
    const isEditing = editingGroupId === group.id;

    const handleStartEditing = () => setEditingGroupId(group.id);
    const handleFinishEditing = () => setEditingGroupId(null);

    return (
      <MeterGroupToggleCard
        key={group.id}
        group={group}
        boundaryLabel={boundaryLabel}
        onEdit={() => openEditGroupModal(group)}
        onClone={() => onCloneGroup(group.id)}
        onDelete={() => setDeleteGroupId(group.id)}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-onSurfaceVariant">
              Meters configuration
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openCreateMeterModal(group)}
                  >
                    Add meter
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setAssignModal({ group })}
                  >
                    Assign assets
                  </Button>
                  <Button size="sm" onClick={handleFinishEditing}>
                    Done
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="secondary" onClick={handleStartEditing}>
                  Edit
                </Button>
              )}
            </div>
          </div>
          <MeterTable
            meters={group.meters}
            onEdit={(meter) => openEditMeterModal(group, meter)}
            onRemove={(meter) => setDeleteMeterState({ group, meter })}
            isEditing={isEditing}
          />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-onSurfaceVariant">
            Assigned assets
          </h4>
          {group.assignedAssets.length === 0 ? (
            <div className="text-sm text-onSurfaceVariant">
              No assets assigned yet.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {group.assignedAssets.map((asset) =>
                isEditing ? (
                  <RemovableAssetChip
                    key={asset.id}
                    asset={asset}
                    onDelete={() => onRemoveAsset(group.id, asset.id)}
                  />
                ) : (
                  <AssetChip key={asset.id} asset={asset} />
                )
              )}
            </div>
          )}
        </div>
      </MeterGroupToggleCard>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-md border border-outlineVariant bg-surfaceContainer p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-onSurface">Meter groups</h2>
          <p className="text-sm text-onSurfaceVariant">
            Organize meters by asset group and define boundary actions for automated workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={openCreateGroupModal}>
            New group
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {groups.length === 0 ? (
          <Card className="text-center text-onSurfaceVariant">
            <p>No meter groups created yet. Start by creating your first group.</p>
          </Card>
        ) : (
          groups.map(renderGroupCard)
        )}
      </div>

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
                Provide a clear name, description, and boundary trigger to control automation.
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-onSurface">Boundary trigger</label>
                <div className="grid gap-2">
                  {boundaryOptions.map((option) => {
                    const isActive = groupForm.boundaryTrigger === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setGroupForm((prev) => ({
                            ...prev,
                            boundaryTrigger: option.value,
                          }))
                        }
                        className={cn(
                          "flex flex-col rounded-md border px-4 py-3 text-left transition",
                          isActive
                            ? "border-primary bg-primary text-onPrimary"
                            : "border-outlineVariant bg-surface hover:border-primary/40"
                        )}
                      >
                        <span className="text-sm font-semibold">{option.label}</span>
                        <span
                          className={cn(
                            "text-xs",
                            isActive ? "text-onPrimary/80" : "text-onSurfaceVariant"
                          )}
                        >
                          Defines how the system reacts when meter values cross configured thresholds.
                        </span>
                      </button>
                    );
                  })}
                </div>
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

      {meterModal ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setMeterModal(null);
          }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {meterModal.mode === "create"
                  ? `Add meter to ${meterModal.group.name}`
                  : `Edit meter • ${meterModal.meter.name}`}
              </DialogTitle>
              <DialogDescription>
                Configure the measurement unit and optional boundary thresholds for automated alerts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-onSurface">Meter name</label>
                  <Input
                    value={meterForm.name}
                    placeholder="e.g. Runtime Hours"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setMeterForm((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-onSurface">Unit of measure</label>
                  <Input
                    value={meterForm.unit}
                    placeholder="e.g. hrs, °C, %"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setMeterForm((prev) => ({
                        ...prev,
                        unit: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-3">
                <span className="text-sm font-medium text-onSurface">Meter type</span>
                <div className="grid gap-2 md:grid-cols-2">
                  {meterTypeOptions.map((option) => {
                    const isActive = meterForm.type === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setMeterForm((prev) => ({
                            ...prev,
                            type: option.value,
                          }))
                        }
                        className={cn(
                          "flex flex-col rounded-md border px-4 py-3 text-left transition",
                          isActive
                            ? "border-primary bg-primary text-onPrimary"
                            : "border-outlineVariant bg-surface hover:border-primary/40"
                        )}
                      >
                        <span className="text-sm font-semibold">{option.label}</span>
                        <span
                          className={cn(
                            "text-xs",
                            isActive ? "text-onPrimary/80" : "text-onSurfaceVariant"
                          )}
                        >
                          {option.helper}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-onSurface">Lower boundary</label>
                  <Input
                    type="number"
                    value={meterForm.lowerBoundary ?? ""}
                    placeholder="Optional"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setMeterForm((prev) => ({
                        ...prev,
                        lowerBoundary: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                  />
                  <p className="text-xs text-onSurfaceVariant">
                    Automation will trigger when reading drops below this value.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-onSurface">Upper boundary</label>
                  <Input
                    type="number"
                    value={meterForm.upperBoundary ?? ""}
                    placeholder="Optional"
                    onChange={(event: ChangeEvent<HTMLInputElement>) =>
                      setMeterForm((prev) => ({
                        ...prev,
                        upperBoundary: event.target.value
                          ? Number(event.target.value)
                          : undefined,
                      }))
                    }
                  />
                  <p className="text-xs text-onSurfaceVariant">
                    Automation will trigger when reading rises above this value.
                  </p>
                </div>
              </div>
              {formError ? <p className="text-sm text-error">{formError}</p> : null}
            </div>
            <DialogFooter>
              <div className="flex w-full justify-end gap-2">
                <Button variant="secondary" onClick={() => setMeterModal(null)}>
                  Cancel
                </Button>
                <Button onClick={handleMeterSubmit}>
                  {meterModal.mode === "create" ? "Add meter" : "Save changes"}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {deleteMeterState ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleteMeterState(null);
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Remove meter "{deleteMeterState.meter.name}"</DialogTitle>
              <DialogDescription>
                Decide whether you want to keep historical readings for audit purposes or remove them entirely.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <p>
                Removing this meter will detach it from group "{deleteMeterState.group.name}". You can either preserve existing readings as archived records or permanently delete them.
              </p>
              <div className="rounded-md border border-outlineVariant bg-surfaceContainer p-4 text-xs text-onSurfaceVariant">
                <p className="font-semibold text-onSurface">What happens next?</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>Assigned assets will no longer capture future readings for this meter.</li>
                  <li>Preserved readings remain visible in history marked as archived.</li>
                  <li>Deleted readings are permanently removed from the history list.</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <div className="flex w-full flex-wrap justify-end gap-2">
                <Button variant="secondary" onClick={() => setDeleteMeterState(null)}>
                  Cancel
                </Button>
                <Button variant="secondary" onClick={() => handleDeleteMeter(false)}>
                  Keep readings &amp; remove
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteMeter(true)}>
                  Delete meter &amp; readings
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}

      {assignModal ? (
        <AssignAssetsDialog
          group={assignModal.group}
          availableAssets={availableAssets}
          assetAssignments={assetAssignments}
          onClose={() => setAssignModal(null)}
          onAssign={(assetIds, strategy) => {
            onAssignAssets(assignModal.group.id, assetIds, strategy);
            setAssignModal(null);
          }}
        />
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
                    setEditingGroupId((current) => (current === deleteGroupId ? null : current));
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

interface AssignAssetsDialogProps {
  group: MeterGroup;
  availableAssets: Asset[];
  assetAssignments: Map<string, { groupId: string; groupName: string }>;
  onAssign: (assetIds: string[], strategy: MeterAssignmentStrategy) => void;
  onClose: () => void;
}

const AssignAssetsDialog = ({
  group,
  availableAssets,
  assetAssignments,
  onAssign,
  onClose,
}: AssignAssetsDialogProps) => {
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>(
    group.assignedAssets.map((asset) => asset.id)
  );
  const [strategy, setStrategy] = useState<MeterAssignmentStrategy>("move");
  const [searchText, setSearchText] = useState("");

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetIds((prev) => {
      const set = new Set(prev);
      if (set.has(assetId)) {
        set.delete(assetId);
      } else {
        set.add(assetId);
      }
      return Array.from(set);
    });
  };

  const filteredAssets = availableAssets.filter((asset) => {
    const search = searchText.trim().toLowerCase();
    if (!search) return true;
    return (
      asset.name.toLowerCase().includes(search) ||
      asset.id.toLowerCase().includes(search) ||
      asset.category?.toLowerCase().includes(search)
    );
  });

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign assets to {group.name}</DialogTitle>
          <DialogDescription>
            Selected assets will capture meter readings defined for this group. Choose whether to move assets out of other groups or allow sharing.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-md border border-outlineVariant bg-surfaceContainer p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-onSurfaceVariant">
              Assignment strategy
            </span>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "move", label: "Move" },
                  { value: "share", label: "Share" },
                ] as const
              ).map((option) => {
                const isActive = strategy === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStrategy(option.value)}
                    className={cn(
                      "rounded-md border px-4 py-2 text-sm font-semibold transition",
                      isActive
                        ? "border-primary bg-primary text-onPrimary"
                        : "border-outlineVariant bg-surface hover:border-primary/40"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-onSurfaceVariant">
              <strong>Move</strong> removes assets from other groups. <strong>Share</strong> keeps them linked to their current groups.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Input
                value={searchText}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setSearchText(event.target.value)
                }
                placeholder="Search asset name, code, or category"
              />
              <span className="text-sm text-onSurfaceVariant">
                {selectedAssetIds.length} selected
              </span>
            </div>
            <div className="max-h-[360px] overflow-y-auto rounded-md border border-outlineVariant">
              <table className="w-full text-sm">
                <thead className="bg-secondaryContainer text-left text-xs font-semibold uppercase tracking-wide text-onSurfaceVariant">
                  <tr>
                    <th className="px-4 py-3">Asset</th>
                    <th className="w-32 px-4 py-3">Category</th>
                    <th className="w-32 px-4 py-3">Status</th>
                    <th className="w-40 px-4 py-3">Current group</th>
                    <th className="w-24 px-4 py-3 text-right">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outlineVariant bg-surface">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-onSurfaceVariant"
                      >
                        No assets match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map((asset) => {
                      const assignment = assetAssignments.get(asset.id);
                      const isSelected = selectedAssetIds.includes(asset.id);
                      const isAssignedToOtherGroup =
                        assignment && assignment.groupId !== group.id;

                      return (
                        <tr key={asset.id} className="text-onSurface">
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="font-semibold">{asset.name}</span>
                              <span className="text-xs text-onSurfaceVariant">{asset.id}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-onSurfaceVariant">
                            {asset.category ?? "—"}
                          </td>
                          <td className="px-4 py-3 text-onSurfaceVariant">
                            {assignment ? (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                                  assignment.groupId === group.id
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                )}
                              >
                                {assignment.groupName}
                              </span>
                            ) : (
                              <span className="text-xs text-onSurfaceVariant">Not assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => toggleAssetSelection(asset.id)}
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-semibold transition",
                                isSelected
                                  ? "border-primary bg-primary text-onPrimary"
                                  : "border-outlineVariant bg-surface hover:border-primary/40"
                              )}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </button>
                            {isAssignedToOtherGroup && strategy === "share" ? (
                              <p className="mt-1 text-[11px] text-amber-600">
                                Sharing with {assignment.groupName}
                              </p>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => onAssign(selectedAssetIds, strategy)}
              disabled={selectedAssetIds.length === 0}
            >
              Assign selected assets
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MeterGroupsView;
