import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Button, Card } from "@/components/ui/components";
import { Input, TextArea } from "@/components/ui/components/Input";
import { DataTable } from "@/components/ui/components/Table/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { cn } from "@/utils/utils";
import {
  type Asset,
  type Meter,
  type MeterGroup,
  type MeterReading,
  type MeterReadingDraft,
} from "../../../types/meter";

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
};

const violationCopy: Record<NonNullable<MeterReading["boundaryViolation"]>, string> = {
  lower: "Below lower boundary",
  upper: "Above upper boundary",
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

const findViolation = (meter: Meter, value: number) => {
  if (Number.isNaN(value)) return undefined;
  if (typeof meter.lowerBoundary === "number" && value < meter.lowerBoundary) {
    return "lower" as const;
  }
  if (typeof meter.upperBoundary === "number" && value > meter.upperBoundary) {
    return "upper" as const;
  }
  return undefined;
};

const buildEmptyDraft = (meters: Meter[]): Record<string, MeterDraft> =>
  meters.reduce<Record<string, MeterDraft>>((acc, meter) => {
    acc[meter.id] = { value: "", notes: "" };
    return acc;
  }, {});

export const MeterReadingsView = ({
  groups,
  activeUser,
  onSaveReadings,
  onDeleteReading,
  getReadingsByAssetId,
  getReadingSummaryByMeterId,
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
    assetOptions[0]?.asset.id ?? ""
  );
  const [meterDrafts, setMeterDrafts] = useState<Record<string, MeterDraft>>(
    buildEmptyDraft(assetOptions[0]?.group.meters ?? [])
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const selectedOption = useMemo(() =>
    assetOptions.find((option) => option.asset.id === selectedAssetId),
  [assetOptions, selectedAssetId]);

  const selectedGroup = selectedOption?.group;
  const selectedAsset = selectedOption?.asset;

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
      assetId: selectedAsset.id,
      entries,
    });

    setMeterDrafts(buildEmptyDraft(selectedGroup.meters));
    setFormError(null);
    setFormSuccess(`New readings saved as ${activeUser}.`);
  };

  const assetHistory = selectedAsset?.id
    ? getReadingsByAssetId(selectedAsset.id)
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
        id: "boundary",
        header: "Boundary",
        cell: ({ row }) => (
          row.original.boundaryViolation ? (
            <span className="inline-flex rounded-full bg-error/10 px-3 py-1 text-xs font-semibold text-error">
              {violationCopy[row.original.boundaryViolation]}
            </span>
          ) : (
            <span className="text-xs text-onSurfaceVariant">Within range</span>
          )
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
      <Card className="space-y-4">
        <header className="flex flex-col gap-2 border-b border-outlineVariant pb-4">
          <h2 className="text-lg font-semibold text-onSurface">Record readings</h2>
          <p className="text-sm text-onSurfaceVariant">
            Select an asset and capture the latest meter readings. Boundary violations are highlighted instantly.
          </p>
        </header>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-onSurface">Asset</span>
            <div className="grid gap-2 md:grid-cols-2">
              {assetOptions.map((option) => {
                const isActive = selectedAssetId === option.asset.id;
                return (
                  <button
                    key={option.asset.id}
                    type="button"
                    onClick={() => setSelectedAssetId(option.asset.id)}
                    className={cn(
                      "rounded-md border px-4 py-3 text-left transition",
                      isActive
                        ? "border-primary bg-primary text-onPrimary"
                        : "border-outlineVariant bg-surface hover:border-primary/40"
                    )}
                  >
                    <span className="text-sm font-semibold">
                      {option.asset.name}
                    </span>
                    <span className={cn("text-xs", isActive ? "text-onPrimary/80" : "text-onSurfaceVariant")}
                    >
                      {option.asset.code} • {option.group.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedGroup && selectedAsset ? (
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                {selectedGroup.meters.map((meter) => {
                  const draft = meterDrafts[meter.id] ?? { value: "", notes: "" };
                  const numericValue = Number(draft.value);
                  const violation = findViolation(meter, numericValue);
                  const lastReading = getReadingSummaryByMeterId(
                    meter.id,
                    selectedAsset.id
                  );

                  return (
                    <div
                      key={meter.id}
                      className={cn(
                        "flex flex-col gap-3 rounded-md border p-4",
                        violation
                          ? "border-error bg-error/5"
                          : "border-outlineVariant bg-surfaceContainer"
                      )}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-onSurface">
                            {meter.name}
                          </span>
                          {violation && (
                            <span className="rounded-full bg-error px-2 py-1 text-[11px] font-semibold text-onError">
                              {violationCopy[violation]}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-onSurfaceVariant">
                          {typeof meter.lowerBoundary === "number" ||
                          typeof meter.upperBoundary === "number"
                            ? `Threshold: ${
                                meter.lowerBoundary !== undefined
                                  ? `≥ ${meter.lowerBoundary}`
                                  : ""
                              }${
                                meter.lowerBoundary !== undefined &&
                                meter.upperBoundary !== undefined
                                  ? " and "
                                  : ""
                              }${
                                meter.upperBoundary !== undefined
                                  ? `≤ ${meter.upperBoundary}`
                                  : ""
                              } ${meter.unit}`
                            : "No boundaries configured"}
                        </p>
                        {lastReading && (
                          <p className="text-xs text-onSurfaceVariant">
                            Last reading: {lastReading.value} {meter.unit} • {formatRelativeTime(lastReading.recordedAt)}
                          </p>
                        )}
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
                        <TextArea
                          rows={3}
                          placeholder={
                            meter.notesPlaceholder ?? "Optional notes"
                          }
                          value={draft.notes}
                          onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                            handleNotesChange(meter.id, event.target.value)
                          }
                        />
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
                <Button variant="secondary" onClick={() => setMeterDrafts(buildEmptyDraft(selectedGroup.meters))}>
                  Clear values
                </Button>
                <Button onClick={handleSaveReadings}>Save readings</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-outlineVariant bg-surfaceContainer p-6 text-center text-sm text-onSurfaceVariant">
              Select an asset to enter readings.
            </div>
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <header className="flex flex-col gap-2 border-b border-outlineVariant pb-4">
          <h3 className="text-lg font-semibold text-onSurface">Reading history</h3>
          <p className="text-sm text-onSurfaceVariant">
            Review the captured readings for the selected asset. Use the delete action to correct erroneous entries.
          </p>
        </header>
        <DataTable
          data={assetHistory}
          columns={readingColumns}
          showCheckbox={false}
          showPagination={assetHistory.length > 10}
        />
      </Card>
    </div>
  );
};

export default MeterReadingsView;
