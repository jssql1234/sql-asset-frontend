import { useMemo, useState } from "react";
import { DataTableExtended, type RowAction } from "@/components/DataTableExtended";
import type { ColumnDef, GroupingState, ExpandedState } from "@tanstack/react-table";
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
  const [grouping, setGrouping] = useState<GroupingState>(["meter"]);
  const [expanded, setExpanded] = useState<ExpandedState>(true);

  const readingColumns = useMemo<ColumnDef<MeterReading>[]>(
    () => [
      {
        id: "timestamp",
        header: "DateTime",
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
      },
      {
        id: "meter",
        header: "Meter",
        accessorKey: "uom",
        cell: ({ row, getValue }) => {
          if (row.getIsGrouped()) {
            return (
              <div className="flex items-center gap-2 font-semibold text-onSurface hover:text-primary py-2 px-1 rounded">
                <span>{row.getIsExpanded() ? "▼" : "▶"}</span>
                <span>{getValue() as string}</span>
                <span className="text-xs text-onSurfaceVariant">
                  ({row.subRows.length} readings)
                </span>
              </div>
            );
          }
          return (
            <div className="flex flex-col text-sm text-onSurface">
              <span className="font-medium">{row.original.uom}</span>
            </div>
          );
        },
        enableGrouping: true,
      },
      {
        id: "group",
        header: "Group",
        accessorFn: (row) => meterMetadata.get(row.meterId)?.group.name ?? "—",
        cell: ({ row, getValue }) => {
          if (row.getIsGrouped()) return null;
          return (
            <span className="text-sm text-onSurfaceVariant">
              {getValue() as string}
            </span>
          );
        },
      },
      {
        accessorKey: "value",
        header: "Reading",
        cell: ({ row, getValue }) => {
          if (row.getIsGrouped()) return null;
          return (
            <span className="text-sm font-semibold text-onSurface">
              {getValue() as number}
            </span>
          );
        },
        aggregationFn: "count",
      },
      {
        id: "user",
        header: "Recorded by",
        accessorKey: "recordedBy",
        cell: ({ row, getValue }) => {
          if (row.getIsGrouped()) return null;
          return (
            <span className="text-sm text-onSurfaceVariant">
              {getValue() as string}
            </span>
          );
        },
      },
      {
        id: "notes",
        header: "Notes",
        accessorKey: "notes",
        cell: ({ row, getValue }) => {
          if (row.getIsGrouped()) return null;
          return (
            <span className="text-sm text-onSurfaceVariant">
              {(getValue() as string) ?? "—"}
            </span>
          );
        },
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
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-onSurface">
          <input
            type="checkbox"
            checked={grouping.includes("meter")}
            onChange={(e) => {
              setGrouping(e.target.checked ? ["meter"] : []);
            }}
            className="rounded border-outline"
          />
          Group by Meter
        </label>
      </div>

      <DataTableExtended
        data={readings}
        columns={readingColumns}
        showCheckbox={false}
        showPagination={true}
        enableGrouping={true}
        grouping={grouping}
        onGroupingChange={setGrouping}
        expanded={expanded}
        onExpandedChange={setExpanded}
        rowActions={rowActions}
      />
    </div>
  );
};
