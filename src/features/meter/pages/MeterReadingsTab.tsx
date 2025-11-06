import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/components";
import { SearchableDropdown } from "@/components/SearchableDropdown";
import { useToast } from "@/components/ui/components/Toast/useToast";
import { RecordReadingsSection } from "../components/RecordReadingsSection";
import { MeterReadingHistoryTable } from "../components/ReadingTable";
import type { MeterDraft } from "../components/ReadingInputCard";
import {
  type Meter,
  type MeterGroup,
  type MeterReading,
  type MeterReadingDraft,
} from "@/types/meter";
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
  const { addToast } = useToast();
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
  }, [selectedGroup?.id]);

  const handleValueChange = (meterId: string, value: string) => {
    setFormError(null);
    setMeterDrafts((prev) => ({
      ...prev,
      [meterId]: {
        ...prev[meterId],
        value,
      },
    }));
  };

  const handleNotesChange = (meterId: string, notes: string) => {
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
    addToast({
      title: "Success",
      description: `New readings saved as ${activeUser}.`,
      variant: "success",
      duration: 5000,
      dismissible: false,
    });
  };

  const assetHistory = selectedAsset?.id
    ? getReadingsByAssetId(selectedAsset.id.toString())
    : [];

  if (assetOptions.length === 0) {
    return (
      <>
        <h3 className="text-lg font-semibold text-onSurface">No assets assigned</h3>
        <p className="mt-2 text-sm">
          Assign at least one asset to a meter group to start capturing readings.
        </p>

      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section 1: Asset Selection */}
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

      {/* Section 2: Record Readings */}
      <RecordReadingsSection
        selectedGroup={selectedGroup}
        meterDrafts={meterDrafts}
        formError={formError}
        onValueChange={handleValueChange}
        onNotesChange={handleNotesChange}
        onToggleAllNotes={toggleAllNotesVisibility}
        onSaveReadings={handleSaveReadings}
        onClearError={() => setFormError(null)}
      />

      {/* Section 3: Reading History */}
        <h3 className="text-lg font-semibold text-onSurface">Meter Reading History</h3>
        <MeterReadingHistoryTable
          readings={assetHistory}
          meterMetadata={meterMetadata}
          onDeleteReading={onDeleteReading}
        />
    </div>
  );
};

export default MeterReadingsView;
