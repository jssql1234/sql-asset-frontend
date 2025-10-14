import { type ChangeEvent } from "react";
import { Input, TextArea } from "@/components/ui/components/Input";

export type MeterDraft = {
  value: string;
  notes: string;
  showNotes?: boolean;
};

interface MeterInputCardProps {
  meterId: string;
  uom: string;
  draft: MeterDraft;
  onValueChange: (meterId: string, value: string) => void;
  onNotesChange: (meterId: string, notes: string) => void;
}

export const MeterInputCard = ({
  meterId,
  uom,
  draft,
  onValueChange,
  onNotesChange,
}: MeterInputCardProps) => {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-outlineVariant bg-surfaceContainer p-3 min-w-0">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-onSurface truncate">
          {uom}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <Input
          value={draft.value}
          inputMode="decimal"
          placeholder={`Enter ${uom}`}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onValueChange(meterId, event.target.value)
          }
        />

        {/* Collapsible Notes Section */}
        {draft.showNotes && (
          <div className="animate-in slide-in-from-top-2 duration-200">
            <TextArea
              rows={2}
              placeholder="Optional notes"
              value={draft.notes}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                onNotesChange(meterId, event.target.value)
              }
              className="text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};
