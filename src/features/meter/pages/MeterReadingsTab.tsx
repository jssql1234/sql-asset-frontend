import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button, Card } from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import { DataTable } from "@/components/ui/components/Table/DataTable";
import { SearchableDropdown } from "@/components/SearchableDropdown";
import type { ColumnDef } from "@tanstack/react-table";
import {
  type Meter,
  type MeterGroup,
  type MeterReading,
  type MeterReadingDraft,
} from "../../../types/meter";
import type { Asset } from "@/types/asset";

interface MeterReadingsViewProps {
  groups: MeterGroup[];
  activeUser: string;
  onSaveReadings: (payload: {
    groupId: string;
    assetId: string;
    entries: MeterReadingDraft[];
  }) => void;
  onDeleteReading: (readingId: string) => void;
  getReadingsByAssetId: (assetId: string) => MeterReading[];
  getReadingSummaryByMeterId: (meterId: string, assetId?: string) => MeterReading | undefined;
}

type AssetOption = {
  group: MeterGroup;
  asset: Asset;
};

type MeterDraft = {
  value: string;
  notes: string;
  showNotes?: boolean;
};

const formatTimestamp = (iso: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));

const formatRelativeTime = (iso: string) => {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMinutes = Math.round((now - then) / (1000 * 60));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const buildEmptyDraft = (meters: Meter[]): Record<string, MeterDraft> =>
  meters.reduce<Record<string, MeterDraft>>((acc, meter) => {
    acc[meter.id] = { value: "", notes: "", showNotes: false };
    return acc;
  }, {});

export const MeterReadingsView = ({
  groups,
  activeUser,
  onSaveReadings,
  onDeleteReading,
  getReadingsByAssetId,
}: MeterReadingsViewProps) => {
  const assetOptions = useMemo<AssetOption[]>(() => {
    return groups.flatMap((group) =>
      group.assignedAssets.map((asset) => ({ group, asset }))
    );
  }, [groups]);

  const meterMetadata = useMemo(() => {
    const map = new Map<string, { meter: Meter; group: MeterGroup }>();
    groups.forEach((group) => {
      group.meters.forEach((meter) => {
        map.set(meter.id, { meter, group });
      });
    });
    return map;
  }, [groups]);

  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    assetOptions[0]?.asset.id.toString() ?? ""
  );
  const [meterDrafts, setMeterDrafts] = useState<Record<string, MeterDraft>>(
    buildEmptyDraft(assetOptions[0]?.group.meters ?? [])
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const selectedOption = useMemo(() =>
    assetOptions.find((option) => option.asset.id.toString() === selectedAssetId),
  [assetOptions, selectedAssetId]);

  const selectedGroup = selectedOption?.group;
  const selectedAsset = selectedOption?.asset;

  // Prepare dropdown options
  const dropdownOptions = useMemo(() => 
    assetOptions.map(option => ({
      id: option.asset.id.toString(),
      label: option.asset.name || option.asset.description || `Asset ${option.asset.id}`,
      sublabel: `${option.group.name} • ID: ${option.asset.id}`,
    })),
    [assetOptions]
  );

  useEffect(() => {
    if (!selectedGroup) {
      setMeterDrafts({});
      return;
    }

    setMeterDrafts(buildEmptyDraft(selectedGroup.meters));
    setFormError(null);
    setFormSuccess(null);
  }, [selectedGroup?.id]);

  const handleValueChange = (meterId: string, value: string) => {
    setFormError(null);
    setFormSuccess(null);
    setMeterDrafts((prev) => ({
      ...prev,
      [meterId]: {
        ...prev[meterId],
        value,
      },
    }));
  };

  const handleNotesChange = (meterId: string, notes: string) => {
    setFormSuccess(null);
    setMeterDrafts((prev) => ({
      ...prev,
      [meterId]: {
        ...prev[meterId],
        notes,
      },
    }));
  };

  const toggleAllNotesVisibility = () => {
    if (!selectedGroup) return;
    
    // Check if any notes are currently visible
    const anyNotesVisible = selectedGroup.meters.some(
      meter => meterDrafts[meter.id]?.showNotes
    );
    
    // Toggle all notes to the opposite state
    const newDrafts = { ...meterDrafts };
    selectedGroup.meters.forEach(meter => {
      if (newDrafts[meter.id]) {
        newDrafts[meter.id] = {
          ...newDrafts[meter.id],
          showNotes: !anyNotesVisible,
        };
      }
    });
    
    setMeterDrafts(newDrafts);
  };

  const handleSaveReadings = () => {
    if (!selectedGroup || !selectedAsset) {
      setFormError("Select an asset with assigned meters to record readings.");
      return;
    }

    const drafts = Object.entries(meterDrafts)
      .map(([meterId, draft]) => ({
        meterId,
        value: draft.value.trim(),
        notes: draft.notes.trim(),
      }))
      .filter((draft) => draft.value !== "");

    if (drafts.length === 0) {
      setFormError("Enter at least one reading before saving.");
      return;
    }

    const entries: MeterReadingDraft[] = drafts.map((draft) => ({
      meterId: draft.meterId,
      value: Number(draft.value),
      notes: draft.notes ? draft.notes : undefined,
    }));

    const invalidEntry = entries.find((entry) => Number.isNaN(entry.value));
    if (invalidEntry) {
      setFormError("One or more readings contain invalid numbers.");
      return;
    }

    onSaveReadings({
      groupId: selectedGroup.id,
      assetId: selectedAsset.id.toString(),
      entries,
    });

    setMeterDrafts(buildEmptyDraft(selectedGroup.meters));
    setFormError(null);
    setFormSuccess(`New readings saved as ${activeUser}.`);
  };

  const assetHistory = selectedAsset?.id
    ? getReadingsByAssetId(selectedAsset.id.toString())
    : [];

  const readingColumns = useMemo<ColumnDef<MeterReading>[]>(
    () => [
      {
        id: "timestamp",
        header: "Recorded",
        cell: ({ row }) => (
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-onSurface">
              {formatTimestamp(row.original.recordedAt)}
            </span>
            <span className="text-xs text-onSurfaceVariant">
              {formatRelativeTime(row.original.recordedAt)}
            </span>
          </div>
        ),
      },
      {
        id: "meter",
        header: "Meter",
        cell: ({ row }) => (
          <div className="flex flex-col text-sm text-onSurface">
            <span className="font-medium">
              {meterMetadata.get(row.original.meterId)?.meter.name ?? "Unknown"}
            </span>
            <span className="text-xs text-onSurfaceVariant">
              {row.original.unit}
            </span>
          </div>
        ),
      },
      {
        id: "group",
        header: "Group",
        cell: ({ row }) => (
          <span className="text-sm text-onSurfaceVariant">
            {meterMetadata.get(row.original.meterId)?.group.name ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "value",
        header: "Reading",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-onSurface">
            {row.original.value}
          </span>
        ),
      },
      {
        id: "user",
        header: "Recorded by",
        cell: ({ row }) => (
          <span className="text-sm text-onSurfaceVariant">
            {row.original.recordedBy}
          </span>
        ),
      },
      {
        id: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <span className="text-sm text-onSurfaceVariant">
            {row.original.notes ?? "—"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="link"
              size="sm"
              onClick={() => onDeleteReading(row.original.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [meterMetadata, onDeleteReading]
  );

  if (assetOptions.length === 0) {
    return (
      <Card className="text-center text-onSurfaceVariant">
        <h3 className="text-lg font-semibold text-onSurface">No assets assigned</h3>
        <p className="mt-2 text-sm">
          Assign at least one asset to a meter group to start capturing readings.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Asset Selection */}
      <Card className="space-y-4 shadow-xl">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-onSurface">Asset Selection</h2>
        </header>

        <div className="flex flex-col gap-2">
          <SearchableDropdown
            items={dropdownOptions}
            selectedId={selectedAssetId}
            onSelect={setSelectedAssetId}
            placeholder="Search and select an asset..."
            className="w-full"
            maxHeight="max-h-48"
            emptyMessage="No assets found"
          />
        </div>
      </Card>

      {/* Section 2: Record Readings */}
      <Card className="space-y-4 shadow-xl">
        <header className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-onSurface">Record Readings</h2>
        </header>

        {selectedGroup && selectedAsset ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {selectedGroup.meters.map((meter) => {
                const draft = meterDrafts[meter.id] ?? { value: "", notes: "", showNotes: false };

                return (
                  <div
                    key={meter.id}
                    className="flex flex-col gap-3 rounded-md border border-outlineVariant bg-surfaceContainer p-3 min-w-0"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold text-onSurface truncate" title={meter.name}>
                        {meter.name}
                      </span>
                      <span className="text-xs text-onSurfaceVariant">
                        Unit: {meter.unit}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Input
                        value={draft.value}
                        inputMode="decimal"
                        placeholder={`Enter ${meter.unit}`}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          handleValueChange(meter.id, event.target.value)
                        }
                      />

                      {/* Collapsible Notes Section */}
                      {draft.showNotes && (
                        <div className="animate-in slide-in-from-top-2 duration-200">
                          <TextArea
                            rows={2}
                            placeholder={meter.notesPlaceholder ?? "Optional notes"}
                            value={draft.notes}
                            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                              handleNotesChange(meter.id, event.target.value)
                            }
                            className="text-sm"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {formError && (
              <div className="rounded-md border border-error bg-error/5 px-4 py-3 text-sm text-error">
                {formError}
              </div>
            )}
            
            {formSuccess && (
              <div className="rounded-md border border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {formSuccess}
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="secondary" 
                onClick={toggleAllNotesVisibility}
              >
                {selectedGroup?.meters.some(meter => meterDrafts[meter.id]?.showNotes) 
                  ? "Hide all notes" 
                  : "Add notes"
                }
              </Button>
              <Button onClick={handleSaveReadings}>Save readings</Button>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-outlineVariant bg-surfaceContainer p-6 text-center text-sm text-onSurfaceVariant">
            Select an asset to enter readings.
          </div>
        )}
      </Card>

      {/* Section 3: Reading History */}
      <Card className="space- shadow-xl">
        <header className="flex flex-col gap-2 pb-4">
          <h3 className="text-lg font-semibold text-onSurface">Meter Reading History</h3>
        </header>
        
        <DataTable
          data={assetHistory}
          columns={readingColumns}
          showCheckbox={false}
          showPagination={assetHistory.length > 10}
        />
      </Card>
      <br />
    </div>
  );
};

export default MeterReadingsView;
