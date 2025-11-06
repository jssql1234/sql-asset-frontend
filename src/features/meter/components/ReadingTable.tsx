import { useMemo } from "react";
import { DataTableExtended, type RowAction } from "@/components/DataTableExtended";
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
  const readingColumns = useMemo<ColumnDef<MeterReading>[]>(
    () => [
      {
        id: "timestamp",
        header: "Date & Time",
        accessorFn: (row) => row.recordedAt,
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
       enableColumnFilter: false,
      },
      {
        id: "meter",
        header: "Meter",
        accessorKey: "uom",
        cell: ({ getValue }) => (
          <span className="text-sm font-medium text-onSurface">
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "group",
        header: "Group",
        accessorFn: (row) => meterMetadata.get(row.meterId)?.group.name ?? "—",
        cell: ({ getValue }) => (
          <span className="text-sm text-onSurfaceVariant">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "value",
        header: "Reading",
        cell: ({ getValue }) => (
          <span className="text-sm font-semibold text-onSurface">
            {getValue() as number}
          </span>
        ),
        enableColumnFilter: false,
      },
      {
        id: "user",
        header: "Recorded by",
        accessorKey: "recordedBy",
        cell: ({ getValue }) => (
          <span className="text-sm text-onSurfaceVariant">
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "notes",
        header: "Notes",
        accessorKey: "notes",
        cell: ({ getValue }) => (
          <span className="text-sm text-onSurfaceVariant">
            {(getValue() as string) ?? "—"}
          </span>
        ),
        enableColumnFilter: false,
      },
    ],
    [meterMetadata]
  );

  const rowActions: RowAction<MeterReading>[] = useMemo(
    () => [
      {
        type: 'delete',
        onClick: (reading) => {
          onDeleteReading(reading.id);
        },
      },
    ],
    [onDeleteReading]
  );

  return (
    <div className="space-y-4">
      <DataTableExtended
        data={readings}
        columns={readingColumns}
        showCheckbox={false}
        showPagination={true}
        rowActions={rowActions}
      />
    </div>
  );
};
