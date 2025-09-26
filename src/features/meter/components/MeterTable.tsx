import { Button } from "@/components/ui/components";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/components/Table";
import type { Meter } from "../../../types/meter";

export type MeterTableProps = {
  meters: Meter[];
  onEdit: (meter: Meter) => void;
  onRemove: (meter: Meter) => void;
  isEditing?: boolean;
};

const formatBoundary = (meter: Meter) => {
  if (
    typeof meter.lowerBoundary === "number" &&
    typeof meter.upperBoundary === "number"
  ) {
    return `${meter.lowerBoundary} – ${meter.upperBoundary} ${meter.unit}`;
  }

  if (typeof meter.lowerBoundary === "number") {
    return `≥ ${meter.lowerBoundary} ${meter.unit}`;
  }

  if (typeof meter.upperBoundary === "number") {
    return `≤ ${meter.upperBoundary} ${meter.unit}`;
  }

  return "—";
};

const MeterTable = ({
  meters,
  onEdit,
  onRemove,
  isEditing = false,
}: MeterTableProps) => {
  if (meters.length === 0) {
    return (
      <div className="rounded border border-dashed border-outlineVariant bg-surfaceContainer p-6 text-center text-sm text-onSurfaceVariant">
        No meters defined yet. Use "Add meter" to start tracking readings.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded border border-outlineVariant bg-surface">
      <Table className="min-w-[720px]">
        <TableHeader className="bg-secondaryContainer uppercase tracking-wide text-onSurfaceVariant">
          <TableRow>
            <TableHead className="w-[240px] px-4 py-3 text-xs font-semibold">
              Meter name
            </TableHead>
            <TableHead className="w-[96px] px-4 py-3 text-xs font-semibold">
              Unit
            </TableHead>
            <TableHead className="w-[144px] px-4 py-3 text-xs font-semibold">
              Type
            </TableHead>
            <TableHead className="w-[192px] px-4 py-3 text-xs font-semibold">
              Boundary
            </TableHead>
            <TableHead className="w-[192px] px-4 py-3 text-xs font-semibold">
              Notes
            </TableHead>
            {isEditing ? (
              <TableHead className="px-4 py-3 text-right text-xs font-semibold">
                Actions
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-outlineVariant">
          {meters.map((meter) => (
            <TableRow key={meter.id} className="text-sm text-onSurface">
              <TableCell className="px-4 py-3 font-medium">
                {meter.name}
              </TableCell>
              <TableCell className="px-4 py-3">{meter.unit}</TableCell>
              <TableCell className="px-4 py-3 capitalize">
                {meter.type}
              </TableCell>
              <TableCell className="px-4 py-3 text-onSurfaceVariant">
                {formatBoundary(meter)}
              </TableCell>
              <TableCell className="px-4 py-3 text-onSurfaceVariant">
                {meter.notesPlaceholder ?? "—"}
              </TableCell>
              {isEditing ? (
                <TableCell className="px-4 py-2">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onEdit(meter)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemove(meter)}
                    >
                      Remove
                    </Button>
                  </div>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MeterTable;
