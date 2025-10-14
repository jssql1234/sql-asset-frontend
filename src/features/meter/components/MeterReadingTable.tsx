import { useMemo, useState } from "react";
import { Button } from "@/components/ui/components";
import { DataTableExtended } from "@/components/DataTableExtended";
import DeleteConfirmationDialog from "../../work-request/components/DeleteConfirmationDialog";
import { Delete } from "@/assets/icons";
import type { ColumnDef } from "@tanstack/react-table";
import type { MeterReading, MeterGroup, Meter } from "@/types/meter";

interface MeterReadingHistoryTableProps {
  readings: MeterReading[];
  meterMetadata: Map<string, { meter: Meter; group: MeterGroup }>;
  onDeleteReading: (readingId: string) => void;
}

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

export const MeterReadingHistoryTable = ({
  readings,
  meterMetadata,
  onDeleteReading,
}: MeterReadingHistoryTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [readingToDelete, setReadingToDelete] = useState<MeterReading | null>(null);

  const handleDeleteClick = (reading: MeterReading) => {
    setReadingToDelete(reading);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (readingToDelete) {
      onDeleteReading(readingToDelete.id);
      setDeleteDialogOpen(false);
      setReadingToDelete(null);
    }
  };
  const readingColumns = useMemo<ColumnDef<MeterReading>[]>(
    () => [
      {
        id: "timestamp",
        header: "DateTime",
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
              {row.original.uom}
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
          <div className="flex">
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDeleteClick(row.original)}
            >
              <Delete></Delete>
            </Button>
          </div>
        ),
      },
    ],
    [meterMetadata, onDeleteReading]
  );

  return (
    <>
      <DataTableExtended
        data={readings}
        columns={readingColumns}
        showCheckbox={false}
        showPagination={true}
      />

      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        itemCount={1}
        itemType="meter reading"
        title="Delete Meter Reading"
        description="Are you sure you want to delete this meter reading? This action cannot be undone."
        itemIds={readingToDelete ? [readingToDelete.id] : []}
        itemNames={readingToDelete ? [`${readingToDelete.uom} - ${readingToDelete.value}`] : []}
      />
    </>
  );
};
