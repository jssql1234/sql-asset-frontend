import { Button, Banner } from "@/components/ui/components";
import { MeterInputCard, type MeterDraft } from "./ReadingInputCard";
import type { MeterGroup, Meter } from "@/types/meter";

interface RecordReadingsSectionProps {
  selectedGroup: MeterGroup | undefined;
  meterDrafts: Record<string, MeterDraft>;
  formError: string | null;
  onValueChange: (meterId: string, value: string) => void;
  onNotesChange: (meterId: string, notes: string) => void;
  onToggleAllNotes: () => void;
  onSaveReadings: () => void;
  onClearError: () => void;
}

export const RecordReadingsSection = ({
  selectedGroup,
  meterDrafts,
  formError,
  onValueChange,
  onNotesChange,
  onToggleAllNotes,
  onSaveReadings,
  onClearError,
}: RecordReadingsSectionProps) => {
  const anyNotesVisible = selectedGroup?.meters.some(
    meter => meterDrafts[meter.id]?.showNotes
  );

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-onSurface">Record Readings</h2>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onToggleAllNotes}>
            {anyNotesVisible ? "Hide all notes" : "Add notes"}
          </Button>
          <Button onClick={onSaveReadings}>Save readings</Button>
        </div>
      </div>

      {selectedGroup ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {selectedGroup.meters.map((meter: Meter) => {
              const draft = meterDrafts[meter.id] ?? {
                value: "",
                notes: "",
                showNotes: false,
              };

              return (
                <MeterInputCard
                  key={meter.id}
                  meterId={meter.id}
                  uom={meter.uom}
                  draft={draft}
                  onValueChange={onValueChange}
                  onNotesChange={onNotesChange}
                />
              );
            })}
          </div>

          {formError && (
            <Banner
              variant="error"
              description={formError}
              dismissible={false}
              onClose={onClearError}
            />
          )}
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-outlineVariant bg-surfaceContainer p-6 text-center text-sm text-onSurfaceVariant">
          Select an asset to enter readings.
        </div>
      )}
    </>
  );
};
